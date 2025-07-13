# CoolPay

Cool Pay is an AI-powered bot enabling any X user to pay each other on Solana via tweeting, with customizable conditions like reply to get paid, and without requiring the recipient user (i.e. the creator) to be pre-onboarded anywhere. The recipient X users can simply collect their crypto payment by logging in with their X account on the platform afterwards, anytime.

## Features

- **Simple Integration**: Easily integrate CoolPay with your application like X using our RESTful APIs or SDKs.
- **Secure Transactions**: Built with industry-standard security, including tokenization and PCI DSS compliance.
- **Flexible Payments**: Support for one-time payments, subscriptions, and refunds.
- **Multi-Token Support**: Process payments in any Solana tokens including stablecoins for wide reach.
- **Developer Tools**: Comprehensive documentation, SDKs, and code examples for quick setup.

## Getting Started

### Prerequisites
- Node.js v14+ or Python 3.8+ (depending on your integration).
- A Privy account and API keys.
- Basic knowledge of REST APIs.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/HYPE3-COOL/coolpay.git
   cd coolpay
   ```

2. Install dependencies
   ```bash
   npm install  # For Node.js-based projects
   # OR
   pip install -r requirements.txt # For Python-based projects
   ```

3. Configure your environment
- Copy `.env.example` to `.env`
- Add your CoolPay API keys:
  ```env
  COOLPAY_API_KEY=your_api_key
  COOLPAY_SECRET=your_secret
  ```

### Usage

- Start the application
  ```bash
  npm start  # For Node.js
  # OR
  python app.py  # For Python
  ```

### Example

Make a simple payment request:

```javascript
const coolpay = require('coolpay-sdk');

const payment = await coolpay.payments.create({
  amount: 1000, // Amount in cents
  currency: 'USD',
  customerId: 'cus_12345',
});

console.log(payment);
```

### Contributing

We welcome contributions! Please follow these steps:

- Fork the repository.
- Create a feature branch (`git checkout -b feature/your-feature`).
- Commit your changes (`git commit -m 'Add your feature'`).
- Push to the branch (`git push origin feature/your-feature`).
- Open a pull request.

### License

This project is licensed under the MIT License. See the LICENSE file for details.


