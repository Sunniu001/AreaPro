import { useEffect } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  // Create a demo wallpaper product tagged with 'areapro'
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 5) {
              edges {
                node {
                  id
                  price
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: "Custom Premium Wallpaper (AreaPro Demo)",
          tags: ["areapro", "wallpaper"],
          status: "ACTIVE",
          options: ["Material"],
          variants: [
            {
              price: "120.00",
              options: ["Non-Woven Fabric"]
            },
            {
              price: "180.00",
              options: ["Canvas Texture"]
            }
          ]
        },
      },
    },
  );
  
  const responseJson = await response.json();
  return {
    product: responseJson.data?.productCreate?.product || null,
  };
};

export default function Index() {
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  useEffect(() => {
    if (fetcher.data?.product?.id) {
      shopify.toast.show("Demo product created!");
    }
  }, [fetcher.data?.product?.id, shopify]);

  const generateDemoProduct = () => fetcher.submit({}, { method: "POST" });

  return (
    <s-page heading="AreaPro: Custom Dimension Pricing">
      <s-button slot="primary-action" onClick={generateDemoProduct} {...(isLoading ? { loading: true } : {})}>
        Create Demo Product
      </s-button>

      <s-section heading="Overview">
        <s-paragraph>
          Welcome to <strong>AreaPro</strong>! This app enables you to sell wallpaper, fabric, flooring, glass, and any other cut-to-size products by custom square-footage or custom dimensions (Height x Width).
        </s-paragraph>
        <s-paragraph>
          AreaPro utilizes Shopify's modern <strong>Cart Transform Functions</strong> to perform real-time, server-side price calculation directly in the Shopify checkout, resolving cart badge issues and eliminating checkout discrepancy problems without requiring drafts orders or external APIs.
        </s-paragraph>
      </s-section>

      <s-section heading="Quick Setup Guide">
        <s-stack direction="block" gap="base">
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="tight">
              <strong>1. Tag Your Products</strong>
              <s-paragraph>
                Add the tag <code>areapro</code> or set the Product Type to <code>Wallpaper</code> for any product you wish to sell by custom area.
              </s-paragraph>
            </s-stack>
          </s-box>

          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="tight">
              <strong>2. Add the Theme Block</strong>
              <s-paragraph>
                Navigate to your online store's Theme Editor, open your Product template, and insert the <strong>AreaPro Calculator</strong> block inside the Product information section.
              </s-paragraph>
            </s-stack>
          </s-box>

          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="tight">
              <strong>3. Configure Material Variants</strong>
              <s-paragraph>
                If your products have different base rates for different materials, create an option named <code>Material</code> (e.g. Canvas, Leather). The widget will automatically display them as selectable tiles and sync prices instantly.
              </s-paragraph>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      <s-section heading="Test and Preview">
        <s-paragraph>
          Click "Create Demo Product" at the top right of this page to automatically generate a pre-configured wallpaper variant tagged with <code>areapro</code> in your store admin.
        </s-paragraph>
        
        {fetcher.data?.product && (
          <s-box padding="base" borderWidth="base" borderRadius="base" background="success">
            <s-stack direction="inline" gap="base" align="center">
              <s-text>Demo Product Created Successfully!</s-text>
              <s-button
                onClick={() => {
                  shopify.intents.invoke?.("edit:shopify/Product", {
                    value: fetcher.data?.product?.id,
                  });
                }}
                target="_blank"
                variant="tertiary"
              >
                Edit Product in Shopify
              </s-button>
            </s-stack>
          </s-box>
        )}
      </s-section>

      <s-section slot="aside" heading="App Specifications">
        <s-paragraph>
          <s-text>Engine: </s-text> Shopify Functions (Cart Transform)
        </s-paragraph>
        <s-paragraph>
          <s-text>Frontend Widget: </s-text> Theme App Extension Block (No theme edit required)
        </s-paragraph>
        <s-paragraph>
          <s-text>Language &amp; Stack: </s-text> React Router, TypeScript, Prisma &amp; Rust/Wasm
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
