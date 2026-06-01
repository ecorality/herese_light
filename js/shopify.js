/**
 * Shopify Storefront API Service for Ecorality
 * Handles cart management and checkout via Shopify Storefront API.
 * 
 * ARCHITECTURE:
 *   Frontend: www.ecorality.com (Cloudflare Pages)
 *   Checkout: checkout.ecorality.com (Shopify)
 *
 * HOW TO CONFIGURE:
 *   1. In Shopify Admin → Settings → Apps → Develop apps → Create app
 *   2. Enable Storefront API with these scopes:
 *      - unauthenticated_read_product_listings
 *      - unauthenticated_write_checkouts
 *      - unauthenticated_read_checkouts
 *   3. Copy the Storefront access token below
 *   4. In Shopify Admin → Settings → Domains, add checkout.ecorality.com
 */

class ShopifyService {
  constructor() {
    // ═══════════════════════════════════════════════════════
    // ⚠️  REPLACE THESE WITH YOUR ACTUAL SHOPIFY CREDENTIALS
    // ═══════════════════════════════════════════════════════
    this.domain = 'ge010m-x8.myshopify.com';               // Your Shopify store domain
    this.accessToken = 'b66657a3fa5b9edbfe8ed5d3d1cff9e3c31c96c539de8f5e2297c878b5eae4de';
    this.checkoutDomain = 'checkout.ecorality.com';         // Custom checkout domain
    this.apiVersion = '2024-04';
    this.endpoint = `https://${this.domain}/api/${this.apiVersion}/graphql.json`;

    // Local cart state
    this.cartId = null;
    this.cartItems = [];
  }

  /**
   * Execute a GraphQL query against the Shopify Storefront API
   */
  async query(gql, variables = {}) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': this.accessToken,
        },
        body: JSON.stringify({ query: gql, variables }),
      });

      const result = await response.json();
      if (result.errors) {
        console.error('[Shopify] API Errors:', result.errors);
        return null;
      }
      return result.data;
    } catch (error) {
      console.error('[Shopify] Fetch Error:', error);
      return null;
    }
  }

  /**
   * Fetch all products with their variant IDs and prices
   * Returns a map of handle → { id, title, price, variantId, currencyCode }
   */
  async getProducts() {
    const gql = `
      query getProducts {
        products(first: 20) {
          edges {
            node {
              id
              title
              handle
              description
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
    const data = await this.query(gql);
    if (!data) return {};

    const productMap = {};
    for (const edge of data.products.edges) {
      const node = edge.node;
      const variant = node.variants.edges[0]?.node;
      if (variant) {
        productMap[node.handle] = {
          id: node.id,
          title: node.title,
          handle: node.handle,
          description: node.description,
          variantId: variant.id,
          price: parseFloat(variant.price.amount),
          currencyCode: variant.price.currencyCode,
          image: node.images.edges[0]?.node?.url || null,
        };
      }
    }
    return productMap;
  }

  /**
   * Create a new Shopify cart
   */
  async createCart(lineItems = []) {
    const gql = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
            lines(first: 20) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      product {
                        title
                        handle
                      }
                    }
                  }
                }
              }
            }
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
          }
          userErrors {
            code
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        lines: lineItems.map(item => ({
          merchandiseId: item.variantId,
          quantity: item.quantity || 1,
        })),
      },
    };

    const data = await this.query(gql, variables);
    if (data?.cartCreate?.cart) {
      this.cartId = data.cartCreate.cart.id;
      return data.cartCreate.cart;
    }

    if (data?.cartCreate?.userErrors?.length) {
      console.error('[Shopify] Cart errors:', data.cartCreate.userErrors);
    }
    return null;
  }

  /**
   * Add lines to an existing cart
   */
  async addToCart(variantId, quantity = 1) {
    if (!this.cartId) {
      // Create a new cart with this item
      return this.createCart([{ variantId, quantity }]);
    }

    const gql = `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            lines(first: 20) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      product {
                        title
                        handle
                      }
                    }
                  }
                }
              }
            }
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
          }
          userErrors {
            code
            field
            message
          }
        }
      }
    `;

    const variables = {
      cartId: this.cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    };

    const data = await this.query(gql, variables);
    return data?.cartLinesAdd?.cart || null;
  }

  /**
   * Get the checkout URL, rewriting domain to checkout.ecorality.com
   */
  getCheckoutUrl(cart) {
    if (!cart?.checkoutUrl) return null;

    // Rewrite the default Shopify checkout URL to use custom domain
    // e.g. https://ecorality.myshopify.com/cart/c/xxx → https://checkout.ecorality.com/cart/c/xxx
    let url = cart.checkoutUrl;
    url = url.replace(
      `https://${this.domain}`,
      `https://${this.checkoutDomain}`
    );
    return url;
  }

  /**
   * FALLBACK: Create a direct checkout URL from cart items (legacy Checkout API)
   * This works even without the Cart API if needed
   */
  buildDirectCheckoutUrl(items) {
    // Build a /cart URL with variant IDs and quantities
    // Format: https://checkout.ecorality.com/cart/VARIANT_ID:QTY,VARIANT_ID:QTY
    const lineItems = items
      .filter(item => item.variantId)
      .map(item => {
        // Extract numeric ID from gid://shopify/ProductVariant/XXXX
        const numericId = item.variantId.includes('gid://')
          ? item.variantId.split('/').pop()
          : item.variantId;
        return `${numericId}:${item.quantity || 1}`;
      })
      .join(',');

    return `https://${this.checkoutDomain}/cart/${lineItems}`;
  }
}

export const shopify = new ShopifyService();
