// Shopify Storefront API Types

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface Image {
  id: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: Money;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  image?: Image;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml?: string;
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  images: {
    edges: {
      node: Image;
    }[];
  };
  variants: {
    edges: {
      node: ProductVariant;
    }[];
  };
  options?: ProductOption[];
  tags: string[];
  productType: string;
  vendor: string;
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image?: Image;
  products: {
    edges: {
      node: Product;
    }[];
  };
}

export interface CartLine {
  id: string;
  quantity: number;
  estimatedCost: {
    totalAmount: Money;
  };
  merchandise: ProductVariant & {
    product: Product;
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  estimatedCost: {
    totalAmount: Money;
    subtotalAmount: Money;
    totalTaxAmount?: Money;
  };
  lines: {
    edges: {
      node: CartLine;
    }[];
  };
}

export interface CartInput {
  lines?: CartLineInput[];
  buyerIdentity?: {
    email?: string;
    phone?: string;
    countryCode?: string;
  };
}

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface ShopifyResponse<T> {
  data: T;
  errors?: {
    message: string;
    locations?: {
      line: number;
      column: number;
    }[];
    path?: string[];
  }[];
  extensions?: {
    cost: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
}

// API Response Types
export interface ProductsResponse {
  products: {
    edges: {
      node: Product;
    }[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
  };
}

export interface ProductByHandleResponse {
  productByHandle: Product | null;
}

export interface CollectionsResponse {
  collections: {
    edges: {
      node: Collection;
    }[];
  };
}

export interface CartCreateResponse {
  cartCreate: {
    cart?: Cart;
    userErrors: {
      field?: string[];
      message: string;
    }[];
  };
}

export interface CartLinesAddResponse {
  cartLinesAdd: {
    cart?: Cart;
    userErrors: {
      field?: string[];
      message: string;
    }[];
  };
}

export interface CartLinesUpdateResponse {
  cartLinesUpdate: {
    cart?: Cart;
    userErrors: {
      field?: string[];
      message: string;
    }[];
  };
}

export interface CartLinesRemoveResponse {
  cartLinesRemove: {
    cart?: Cart;
    userErrors: {
      field?: string[];
      message: string;
    }[];
  };
}

export interface CartResponse {
  cart?: Cart;
}

export interface CartLineUpdateInput {
  id: string;
  quantity: number;
}

// App-specific types
export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  variant: string;
}

export interface AppProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants: {
    id: string;
    title: string;
    price: number;
    available: boolean;
    options: Record<string, string>;
  }[];
  tags: string[];
  type: string;
  vendor: string;
}

export interface AppCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image?: string;
  productCount: number;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Products: { collectionId?: string } | undefined;
  ProductDetail: { productHandle: string };
  Cart: undefined;
  Profile: undefined;
  Search: { query?: string } | undefined;
  Collections: undefined;
  Checkout: { cartId: string };
};

export type TabParamList = {
  HomeTab: undefined;
  ProductsTab: undefined;
  CartTab: undefined;
  ProfileTab: undefined;
};

// Customer Authentication Types
export interface CustomerAddress {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
}

export interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  email: string;
  phone?: string;
  acceptsMarketing: boolean;
  createdAt: string;
  updatedAt: string;
  defaultAddress?: CustomerAddress;
  addresses: {
    edges: {
      node: CustomerAddress;
    }[];
  };
  orders: {
    edges: {
      node: Order;
    }[];
  };
}

export interface Order {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus?: string;
  totalPrice: Money;
  lineItems: {
    edges: {
      node: OrderLineItem;
    }[];
  };
}

export interface OrderLineItem {
  title: string;
  quantity: number;
  variant: {
    id: string;
    title: string;
    price: Money;
    product: {
      id: string;
      title: string;
      handle: string;
      images: {
        edges: {
          node: Image;
        }[];
      };
    };
  };
}

export interface CustomerAccessToken {
  accessToken: string;
  expiresAt: string;
}

export interface CustomerUserError {
  field?: string[];
  message: string;
  code?: string;
}

// Authentication Response Types
export interface CustomerAccessTokenCreateResponse {
  customerAccessTokenCreate: {
    customerAccessToken?: CustomerAccessToken;
    customerUserErrors: CustomerUserError[];
  };
}

export interface CustomerCreateResponse {
  customerCreate: {
    customer?: Customer;
    customerUserErrors: CustomerUserError[];
  };
}

export interface CustomerResponse {
  customer?: Customer;
}

export interface CustomerUpdateResponse {
  customerUpdate: {
    customer?: Customer;
    customerUserErrors: CustomerUserError[];
  };
}

export interface CustomerRecoverResponse {
  customerRecover: {
    customerUserErrors: CustomerUserError[];
  };
}

// Auth Context Types
export interface AuthContextType {
  customer: Customer | null;
  accessToken: string | null;
  isGuest: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  enterAsGuest: () => void;
  updateCustomer: (customerData: Partial<Customer>) => Promise<boolean>;
  recoverPassword: (email: string) => Promise<boolean>;
}

// Add Login and Register to navigation
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};
