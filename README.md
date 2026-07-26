# Stellar Tip Splitter 💸🌟

A complete **React + TypeScript + Vite** Web3 decentralised application for splitting XLM tip payments across multiple recipient addresses in a single atomic Stellar Testnet transaction.

![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-7d56c4?style=for-the-badge&logo=stellar)
![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-v5+-3178c6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Freighter API](https://img.shields.io/badge/@stellar/freighter--api-v6+-00f2fe?style=for-the-badge)

---

## 📸 Screenshots

| Connected Dashboard & Tip Form | Transaction Confirmation & Explorer Link |
| :---: | :---: |
| ![Stellar Tip Splitter Dashboard Placeholder](https://via.placeholder.com/600x350/090d16/00f2fe?text=Stellar+Tip+Splitter+Dashboard) | ![Transaction Hash Result Placeholder](https://via.placeholder.com/600x350/090d16/10b981?text=Multi-Payment+Tx+Result+%2B+Hash) |

---

## 🌟 Key Features

- 🔐 **Wallet Authentication (`WalletConnect`)**: Connect and disconnect Freighter wallet using `@stellar/freighter-api` `requestAccess()` / `getPublicKey()`.
- 💰 **Horizon Account Balance (`BalanceDisplay`)**: Real-time XLM balance query via Horizon server (`https://horizon-testnet.stellar.org`) using `server.loadAccount(address)`.
- 🚰 **Friendbot Testnet Faucet**: 1-click testnet account funding tool (claims 10,000 test XLM instantly).
- 🍕 **Tip Split Engine (`SplitForm`)**: Input total XLM tip amount and recipient addresses (textarea list or dynamic input rows). Automatically calculates equal split amounts per recipient.
- ⚡ **Atomic Multi-Payment Building**: Builds a single transaction using `StellarSdk.TransactionBuilder` containing one `Operation.payment` per recipient.
- 🔐 **Freighter Transaction Signing**: Signs transaction XDR via `freighterApi.signTransaction` with network passphrase `Networks.TESTNET`.
- 🔍 **Live Explorer & Status Banners (`TxResult`)**: Interactive loading states, error diagnostic banners, and success modal displaying transaction hash + link to [Stellar Expert Explorer](https://stellar.expert/explorer/testnet).
- 🛡️ **Comprehensive Validation**: Validates positive tip amount, valid Ed25519 addresses (`G...`), and sufficient XLM balance before submission.
- 🎨 **Tailwind CSS Styling**: Responsive single-page design built with Tailwind CSS.

---

## 🛠️ Tech Stack & Dependencies

- **Core**: React 19, TypeScript, Vite 8
- **Stellar SDKs**: `@stellar/stellar-sdk`, `@stellar/freighter-api`
- **Styling**: Tailwind CSS v4
- **Icons**: `lucide-react`
- **Build Utilities**: `vite-plugin-node-polyfills`

---

## 📁 Component Architecture

```
stellar-white-belt/
├── public/
├── src/
│   ├── components/
│   │   ├── WalletConnect.tsx    # Wallet connect/disconnect button & public key state
│   │   ├── BalanceDisplay.tsx   # Horizon loadAccount balance & Friendbot faucet
│   │   ├── SplitForm.tsx        # Tip amount input, recipient rows, equal split preview
│   │   └── TxResult.tsx         # Success hash banner, explorer link & error diagnostics
│   ├── services/
│   │   └── stellar.ts           # Horizon server connection & multi-payment builder
│   ├── App.tsx                  # Main single-page application state
│   ├── index.css                # Tailwind CSS v4 imports & styles
│   └── main.tsx                 # Application entrypoint
├── index.html
├── package.json
├── tsconfig.json                # TypeScript compiler configuration
├── vercel.json                  # Vercel deployment configuration
└── vite.config.ts               # Vite configuration with polyfills & Tailwind
```

---

## ⚙️ Getting Started

### Prerequisites

1. **Node.js**: Ensure Node.js (v18 or higher) is installed.
2. **Freighter Extension**: Install the Freighter wallet browser extension from [Freighter.app](https://www.freighter.app/).

### Installation & Local Run

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd stellar-white-belt
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

---

## 🧪 How to Test on Stellar Testnet

1. Click **Connect Freighter Wallet** and approve wallet access.
2. If your account is unfunded, click **Fund 10,000 XLM (Friendbot)** to seed test XLM.
3. Enter total tip amount (e.g. `30 XLM`).
4. Enter 2 or 3 testnet recipient addresses in the recipient field (e.g., `GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFXYCZTM6WXIWHCYWCDHY`).
5. Observe the live preview (e.g. `10.0000000 XLM` per person).
6. Click **Split & Send XLM via Freighter**.
7. Confirm the transaction in the Freighter extension popup.
8. View the transaction hash result modal and click **View on Stellar Expert Explorer**.

---

## 🌐 Deploy to Vercel

Pre-configured with `vercel.json`:

1. Push your code to GitHub / GitLab.
2. Import project into [Vercel](https://vercel.com).
3. Set build command `npm run build` and framework preset `Vite`.
4. Click **Deploy**.

---

## 📜 License

MIT License. Built for Stellar Testnet Developer Challenges.
