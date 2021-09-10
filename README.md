# Documentation

**Back-end for on-demand parcel delivery platform startup.**

# ⚠️ WORK IN PROGRESS

[Order](#order)

[Registration and Login](Documentation%202fd3b18594114c9e8afb1afde1199a99/Registration%20and%20Login%2073419bb682be45138785f24536c16d18.md)

[Host](Documentation%202fd3b18594114c9e8afb1afde1199a99/Host%20ed222eef11f449e6a4f5b351aa9fe4d9.md)

[Customer](Documentation%202fd3b18594114c9e8afb1afde1199a99/Customer%207e2ac51387da4f8e9028bb165a64b076.md)

[Calculator](Documentation%202fd3b18594114c9e8afb1afde1199a99/Calculator%20500b080b5f294ea7a5e5b2257cfbfc76.md)

# Order

Order is the central and most important concept in Locly. It represents the lifecycle of customer's item(s), starting from being physically (and independently from Locly) ordered by the Customer, getting delivered to Host and finishing with getting delivered back to Customer.

An item is a **physical good**, purchased by the customer and requested to get forwarded/delivered to the customer through Locly. An order is, therefore, an abstract concept, **a bundle of Items.** 

## Properties

It's important to distinguish between the properties exclusive to Items as well as those exclusive to Orders.

```tsx

type Cost = {
	// ISO 4217 3-letter Currency Codes
	currency: "USD",
	amount: 49.99,
}

type Item = {
	// A unique Item UUID identifier.
  id: UUID;
  // The weight of the physical item, in grams.
  weight: 1400;
	// A customer-given custom name for the item.
  title: "Laptop";
	// OPTIONAL The name of the online store the customer has obtained the order from.
  storeName?: "amazon.com";
	// Collection of references to photo files of the item, uploaded by the host.
  photos: Photo[];
	// Datetime of Host physically receiving the item. Date class instance.
	receivedDate: 2021-07-14T23:13:56.647+00:00;
}

type Order = {
	// A unique Order UUID identifier.
  id: UUID;
	// Status / lifecycle stage of the order.
  status: OrderStatus;
	// id of the customer the order belongs to.
  customerId: UUID;
	// id of the host the order was assigned to.
  hostId: UUID;
	// collection of [Items]() inside the order
  items: Item[];
	// total package weight of the items, ready for delivery from host to customer.
  totalWeight: Gram;
	// the country where the order was purchased from.
  originCountry: "USA";
	// the address the order to be delivered to.
  destination: Address;
	// the initial shipment cost estimate given by the calculator on draft stage.
  initialShipmentCost: Cost;
	// the final shipment cost obtained by the host during delivery.
  finalShipmentCost: Cost;
	// the link to the final shipment cost provided by the postal service provider, uploaded by host.
  calculatorResultUrl?: URL;
};
```

## Order Lifecycle

The order lifecycle stages are defined in OrderStatus type, and provided in the `status` property of each order. The status property is the central data consistency / safety mechanism in the application — e.g. actions meant to be done on `Confirmed` orders are not applicable to orders in `Drafted` or any other stages.

```tsx
enum OrderStatus {
  Drafted = 'drafted',
  Confirmed = 'confirmed',
  Finalized = 'finalized',
  Paid = 'paid',
  Completed = 'completed',
}
```

### Drafted

At `Drafted` stage, orders are simply drafts that reside in customer's part of the application. They haven't been paid for yet, they don't have a host assigned to them, but they still reside in the orders' database collection.

At this stage, orders and items only have the following properties:

```tsx
type Item = {
  id: UUID;
  weight: 1400;
  title: "Laptop";
  storeName?: "amazon.com";
}

type Order = {
  id: UUID;
  status: OrderStatus.Drafted;
  customerId: UUID;
  items: Item[];
  originCountry: "USA";
  destination: Address;
  initialShipmentCost: Cost;
};
```

Orders don't have a:

- `hostId`, as the order is only a draft, hasn't been paid for, and, therefore, hasn't been assigned a host yet.
- `totalWeight`, as the order items haven't been received yet by the host.
- `finalShipmentCost`, `calculatorResultURL`, as the host hasn't yet calculated the final shipment cost through an online postal service calculator.

Items don't have any `photos` or `receivedDate`, because they haven't yet been received by a host.

### Confirmed

At `Confirmed` stage, orders become fully-fledged entities inside the system. To change the status of an order from `Drafted` to `Confirmed`, the system has to match [TODO] the order with a host and the customer has to pay Locly's service fee.

After confirming the order, the customer gets the assigned host's address to deliver the items to.

```tsx
type Item = {
  id: UUID;
  weight: 1400;
  title: "Laptop";
  storeName?: "amazon.com";
}

type Order = {
  id: UUID;
  status: OrderStatus.Confirmed;
  customerId: UUID;
  items: Item[];
  originCountry: "USA";
  destination: Address;
  initialShipmentCost: Cost;
	hostId: UUID;
};
```

Orders get a new `hostId` property — the UUID of the Host that has been assigned to the order. The status changes to `OrderStatus.Confirmed`.

Items within the order remain the same.

### Receiving Items

Between `Confirmed` and `Finalized`, the order is in a "limbo" state. After confirming the order in Locly, the customer purchases their items (that constitute the order) and orders the delivery to the assigned host's address.

If the order contains multiple items, the host can receive each of them at a different time. Upon receiving an item, the host has to send the `ReceiveItem` [TODO] event to the application. The host also has to take photos [TODO] of each item (or packaging) and upload them for each individual item.

```tsx
type Item = {
  id: UUID;
  weight: 1400;
  title: "Laptop";
  storeName?: "amazon.com";
	receivedDate: 2021-07-14T23:13:56.647+00:00;
	photos: UUID[];
}
```

Items get a `receivedDate` – datetime of host receiving that particular item, and `photos` – an array of UUID identifiers of photos uploaded for that particular item.

Order remains unchanged.

### Finalized

TODO

### Paid

TODO

### Completed

TODO

## [Order-Host Matching]()

## API /order

```
/order
  GET    /:orderId      -- Get order by id
	GET    /shipmentCost  -- Get calculator rate for shipment
  POST   /              -- Draft new order
	PATCH  /              -- Edit a draft order
	DELETE /              -- Delete a draft order
	POST   /confirm       -- Confirm order
	POST   /receiveItem   -- Mark an order item as received (Host)
	POST   /itemPhotos    -- Add order item photos (Host)
	POST   /shipmentInfo  -- Submit shipment (delivery) info for order (Host)
	POST   /payShipment   -- Pay for shipment (Customer)
  GET    /:orderId/item/:itemId/photo/:photoId -- Download item photo
```

As described in [Registration and Login](Registration%20and%20Login%2073419bb682be45138785f24536c16d18.md), the user id is passed implicitly with each request in a cookie, so there's no need to explicitly pass `customerId` or `hostId` in the request body.

- **Get order — GET** **/:orderId**

    Route for getting the current host's profile. If the **identity: `Customer`**, the order must belong to the said customer (i.e. `customerId === Customer.id`). If the **identity: `Host`**, the order must be assigned to the said host (i.e. `hostId === Host.id`), which also means that `Drafted` orders are never accessible to any host.

    **Required identity: `Host`** or **`Customer`**

    - **Request:**

        ```tsx
        empty
        ```

    - **Response:**
        - **Success (200)**

            ```json
            {
              "id": "28c850a5-84e7-407e-8d9d-2d56e71d6ba0",
            	// Any OrderStatus
              "status": "confirmed",
              // CONDITIONAL Customer identity (i.e. "customerId" is not visible to hosts)
              "customerId": "48fe0565-306e-4cf9-875e-7cd655aaddc6",
            	// CONDITIONAL OPTIONAL Host identity (i.e. "hostId" is not visible to customers)
              "hostId": "1f104eaa-0e4f-4ff7-9121-8cd8e8396762",
              "items": [
                {
                  "id": "06708d4e-7d74-4512-877f-b0648191691e",
                  "title": "Item #1",
                  "storeName": "Random Store",
                  "weight": 700,
                  // OPTIONAL ISO 8601 simplified extended ISO time format
                  "receivedDate": "2021-07-15T13:53:45.601Z",
            			// OPTIONAL
                  "photos": [
                    "55ad37e7-b5f9-428c-809c-df0143d7b416",
                    "1441e83e-b396-4b54-87da-db05287f93fe",
                    "94bc65d9-523a-4e59-8ffb-5825e6521e8d"
                  ]
                },
                {
                  "id": "af924a10-9b85-4b08-ba4d-4511e225bcc5",
                  "title": "Item #2",
                  "storeName": "Randomer Store",
                  "weight": 450
                }
              ],
            	// OPTIONAL
              "totalWeight": 1450,
              "originCountry": "USA",
              "destination": {
                "addressLine1": "42 Random St.",
                "locality": "Random City",
                "country": "GBR"
              },
            	// CONDITIONAL Customer identity (i.e. "initialShipmentCost" is not visible to hosts)
              "initialShipmentCost": {
                "currency": "USD",
                "amount": 56.99
              },
            	// OPTIONAL
              "finalShipmentCost": {
                "currency": "USD",
                "amount": 65.99
              },
            	// OPTIONAL
              "calculatorResultUrl": "https://www.royalmail.com/price-finder"
            }
            ```

        **+ [Common Auth Errors](Registration%20and%20Login%2073419bb682be45138785f24536c16d18.md)**

- **Get calculator shipment rate — GET** **/shipmentCost**

    Route for getting a shipment rate quote from the calculator.

    **Required identity: `Any / None`**

    - **Request:**

        ```
        Params:
        originCountry       — Country of order's origin (i.e. if the customer is ordering from USA, originCountry='USA'. ISO 3166-1 alpha-3 3-letter country code ('USA', 'RUS', etc.)
        destinationCountry  - Country of order's destination (i.e. where the customer will receive the order).
        totalWeight         - Weight of the order in grams. 

        https://aqueous-caverns-91110.herokuapp.com/order/shipmentCost?originCountry=USA&destinationCountry=IRQ&totalWeight=19960
        ```

    - **Response:**
        - **Success (200)**

            ```json
            {
            	"postalServiceName": "USPS",
            	"currency": "USD",
            	"deliveryZone": "Zone 6",
            	"services": [
            		{
            			"name": "Priority Mail International",
            			"tracked": true,
            			"price": 261.65
            		}
            	]
            }
            ```

        - **Service Unavailable (503)**
            - TODO

        **+ [Common Auth Errors](Registration%20and%20Login%2073419bb682be45138785f24536c16d18.md)**

- **Edit order — PATCH** **/**

    Route for editing an order. Only `Drafted` orders can be edited. Each update will delete the previous draft order and create an updated copy with new UUIDs.

    **Required identity: `Customer`**

    - **Request:**

        ```tsx
        {
        	"orderId": "28c850a5-84e7-407e-8d9d-2d56e71d6ba0",
        	[...Draft order]() → [Request,]()
        }
        ```

    - **Response:**

        See: Draft new order → Response

- **Draft new order — POST** **/**

    Route for creating a new order. Orders are by default ["drafts"]() and need to be confirmed to become "full fledged" orders.

    **Required identity: `Customer`**

    - **Request:**

        ```json
        {
          "items": [
            {
              "title": "Item #1",
              "storeName": "Random Store",
              "weight": 700
            },
            {
              "title": "Item #2",
              "storeName": "Randomer Store",
              "weight": 450
            }
          ],
          "originCountry": "CAN",
          "destination": {
            "addressLine1": "42 Random St.",
            "locality": "Random City",
            "country": "GBR"
          }
        }
        ```

        `destination` is purposefully not tied to `customerId` and is required to submit separately on each draft request. This allows for much more flexibility with setting the destination address and ease of development.

        Why is `originCountry` just a single country code, while `destination` is a whole address? Origin is used to match a host, and hosts are assumed to be able to receive deliveries from anywhere within their country of residence. I.e. if the customer orders an item from New York, USA, it doesn't matter whether a host lives in Massachussetts, USA or California, USA — they are still able to receive the delivery. Hence, the only property we need from origin is the `originCountry`.

        **Front-end notes:** using the `customerId` inside the authorization cookie, fetch customer's saved addresses and display them as a list. If the customer chooses an address from the list, fill it into the `destination` field of the request.

        The customer also can choose to provide a new address. After filling in the address, the customer should be prompted whether they want to save the new address or not. Then, update the address through **[Edit Customer – PATCH /customer](Customer%207e2ac51387da4f8e9028bb165a64b076.md)**.

    - **Response:**
        - **Success (200)**

            ```json
            {
              "id": "28c850a5-84e7-407e-8d9d-2d56e71d6ba0",
              "status": "drafted",
              "customerId": "48fe0565-306e-4cf9-875e-7cd655aaddc6",
              "items": [
                {
                  "id": "06708d4e-7d74-4512-877f-b0648191691e",
                  "title": "Item #1",
                  "storeName": "Random Store",
                  "weight": 700,
                },
                {
                  "id": "af924a10-9b85-4b08-ba4d-4511e225bcc5",
                  "title": "Item #2",
                  "storeName": "Randomer Store",
                  "weight": 450
                }
              ],
              "originCountry": "USA",
              "destination": {
                "addressLine1": "42 Random St.",
                "locality": "Random City",
                "country": "GBR"
              },
              "initialShipmentCost": {
                "currency": "CAD",
                "amount": 77.43
              },
            }
            ```

            **Front-end notes:** The most important property here is `initialShipmentCost`. Clearly display it to the user to show how much the **projected** delivery cost will be. It is important to show to the user that the delivery cost is only an estimate, and actual delivery cost will be paid later, when the host receives all items, and will depend on the actual weight of all the items, packaging weight & size, etc.

        - **Service Unavailable (503)**

            All errors under this code have a mutual "body".

            ```json
            {
            	"message": "SERVICE UNAVAILABLE | ...",
            	"data": {
            		"originCountry": "USA",
            		"destination": { ... },
            		"packages": {
            			"weight": number[],
            		}
            	}
            }
            ```

            - "Origin country `originCountry` not supported by Locly." — lots of internal reasons behind this error. It is possible for Stripe to not support operations in this country, or Locly has no information on postal systems of the country.
            - "Weight `totalWeight` exceeds max specified weight `maxWeight`." — the total provided weight of items exceeds the max allowed weight of the postal service operating in the country (e.g. Royal Mail in UK has a max allowed package weight of 2kg).
            - "Origin country can't be equal to destination country"
            - "Destination country `destinationCountry` is not supported by `postalServiceName` of `originCountry`." — it is possible for the postal service of the origin country to not support deliveries to the destination country provided by the customer.

        **+ [Common Auth Errors](Registration%20and%20Login%2073419bb682be45138785f24536c16d18.md)**

- **Confirm order — POST** **/confirm**

    Route for confirming a draft order. Confirming the order makes the order available to both the customer and the host assigned to the order.

    Confirmation is a complex process with 2 stages:

    - **[Back-end]** Confirmation request stage. The system checks for host availability for the given origin-destination and matches the order with the host. The match is not yet recorded in a database. A Stripe checkout session is created, and the order-host match is *temporarily* saved in the session. The checkout session id is sent in the response.
    💡 See **ConfirmOrder Use Case [TODO]** for technical details.
    - **[Front-end]** The session id is passed to a Stripe client-side library, which generates a special one-time temporary link. The user is redirected through the link, pays for Locly services through Stripe's own payment page. On successful payment, an event is sent through [webhooks](https://stripe.com/docs/webhooks) to **/stripe/webhook** [TODO].
    - **[Back-end]** After the event is received (which verifies customer's successful payment), all the changes are persisted — order status is updated to `confirmed`, `hostId` is added, and the order id is added to the matched host's `orderIds`.
    💡 See **StripeCheckoutWebhook → ConfirmOrderHandler [TODO]** for technical details.

    **Required identity: `Customer`**

    - **Request:**

        ```json
        {
          "orderId": "28c850a5-84e7-407e-8d9d-2d56e71d6ba0"
        }
        ```

    - **Response:**
        - **Success (200)**

            ```json
            {
            	// A random string, starting with "cs", generated by Stripe
              "checkoutId": "cs_a1PScHkDLNG72IiuBM7qmG2ymYDJ2VvIFJh3Iv0oMzrT8cyyLHIbTht97G"
            }
            ```

            **Front-end notes:** redirecting to checkout session: [https://stripe.com/docs/js/checkout/redirect_to_checkout](https://stripe.com/docs/js/checkout/redirect_to_checkout)

            ```jsx
            // Call the backend to create the Checkout Session
            fetch('/order/confirm', { method: 'POST' })
            .then((response) => response.json())
            .then(({ checkoutId }) => 
            	stripe.redirectToCheckout({ sessionId: checkoutId })
            .then((result) => {
              // If `redirectToCheckout` fails due to a browser or network
              // error, you should display the localized error message to your
              // customer using `error.message`.
              if (result.error) {
                alert(result.error.message);
              }
            });
            ```

        - **Service Unavailable (503)**

            ```json
            {
            	"message": "SERVICE UNAVAILABLE | No host available in ${country}",
            	"data": {
            		"country": "USA"
            	}
            }
            ```

            ### Host matching

            Hosts are matched in an improvised "Round Robin" fashion — the host with the **least** number of orders in the country will be matched with the order. This ensures all hosts get equal chance to provide their services (and earn money).

            It is possible that no host is available to be matched with the order. Criteria (a host must satisfy all to match with an order):

            - `host.address.country === order.originCountry`
            - `host.verified === true` — host is [fully onboarded and verified.](Host%20ed222eef11f449e6a4f5b351aa9fe4d9.md)
            - `host.available === true` — host is [available.](Host%20ed222eef11f449e6a4f5b351aa9fe4d9.md)

        **+ [Common Auth Errors](Registration%20and%20Login%2073419bb682be45138785f24536c16d18.md)**

- **Receive item — POST** **/receiveItem**

    Route for marking an item as received by host.

    **Required identity: `Host`**

    - **Request:**

        ```json
        {
          "orderId": "309e38d2-c2d2-4d4e-8c00-384a0ee46a4b",
          "itemId": "594130af-30ae-4115-854a-d2118e7c563a"
        }
        ```

    - **Response:**
        - **Success (200)**

            The marked item gets a `receivedDate` — date of the host marking the item as received.

            ```json
            {
              "receivedDate": "2021-07-14T23:13:56.647+00:00"
            }
            ```

        - **Conflict (409)**

            If an item has already been previously marked as received (and has a `receivedDate`), the request can't be repeated.

            ```json
            {
            	"message": "NOT_ACCEPTABLE | Item already marked as 'received'.",
            	"data": {
            		"orderId": "...",
            		"itemId": "..."
            	}
            }
            ```

        **+ [Common Auth Errors](Registration%20and%20Login%2073419bb682be45138785f24536c16d18.md)**

- **Add item photos — POST** **/itemPhotos**

    Route for adding photo/video files for an item.

    **Required identity: `Host`**

    - **Request:**

        The endpoint accepts only `[form-data](https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects)`. 

        ‼️ The `photo` property (as well as any other form-data properties containing files should **always go the last in the request**, i.e. after all regular JSON properties.

        [https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects](https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects)

        ```json
        orderId: UUID
        itemId: UUID
        photos: File[]
        ```

        ![Order%205b6cda9132e74a51850a1c027b9f4c74/Untitled.png](Order%205b6cda9132e74a51850a1c027b9f4c74/Untitled.png)

        The accepted [file MIME types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) are:

        - image
            - jpeg
            - jpg
            - png
            - gif
            - heic
        - video
            - mp4
            - mpeg
            - avi
            - ogg
            - webm

        The max number of simultaneous file uploads is **4.** (arbitrary choice)

        The max total file size is **7 Mb.** (arbitrary choice)

        **Front-end note:** these requirements should be checked on the front-end, too.

    - **Response:**
        - **Success (200)**

            ```json
            [
            	{
            	  "id": "28c850a5-84e7-407e-8d9d-2d56e71d6ba0",
            		"name": "Some File Name"
            	},
            	...
            ]
            ```

        - **Bad Request (400)**

            Unsupported file type.

            ```json
            {
            	"message": "BAD_REQUEST | Unsupported file mimetype",
            	"data": {
            		"allowedFileMimetypes": {
            			"image": ["jpeg", "png", ...],
            			"video": ["mp4", "webm", ...],
            		},
            		"actualFileMimetype": "application/json",
            	}
            }
            ```

        **+ [Common Auth Errors](Registration%20and%20Login%2073419bb682be45138785f24536c16d18.md)**

- **Retrieve item photo — GET** **/:orderId/item/:itemId/photo/:photoId**

    Route for downloading an uploaded photo/video file for the item.

    **Required identity: `Host`** or **`Customer`**

    - **Request:**

        ```json
        {
          "orderId": "309e38d2-c2d2-4d4e-8c00-384a0ee46a4b",
          "itemId": "594130af-30ae-4115-854a-d2118e7c563a",
        	"photoId": "5decd733-ca3c-4e59-b827-6f6d5590da67"
        }
        ```

    - **Response:**
        - **Success (200)**

            ```json
            {
                "fileName": "5decd733-ca3c-4e59-b827-6f6d5590da67",
                "uploadDate": "2021-07-31T20:14:49.233Z",
                "contentType": "video/mp4",
                "data": "data:video/mp4;base64,..."
            }
            ```

            `data` contains all the file data in [data URL format](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs). 

            [Displaying Data URLs.](http://www.iandevlin.com/blog/2012/09/html5/html5-media-and-data-uri/)

        - **Not Found (404)**

        **+ [Common Auth Errors](Registration%20and%20Login%2073419bb682be45138785f24536c16d18.md)**
