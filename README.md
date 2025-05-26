# OnlyAssets: Real World Assets Tokenization Marketplace

OnlyAssets is a decentralized platform built on the [Sui blockchain](https://sui.io/) that enables the tokenization of real-world assets (RWAs) and facilitates their trading through a marketplace. By leveraging the security and efficiency of the Sui blockchain and the [Move programming language](https://move-language.github.io/move/), OnlyAssets provides a robust solution for asset owners to digitize their assets and for investors to access a diverse range of investment opportunities.

## Table of Contents
- [Introduction](#introduction)
- [Workflow](#workflow)
- [Smart Contracts](#smart-contracts)
  - [admin.move](#adminmove)
  - [issuer_registry.move](#issuer_registrymove)
  - [rwa_asset.move](#rwa_assetmove)
  - [marketplace.move](#marketplacemove)
- [Frontend](#frontend)
- [Installation and Deployment](#installation-and-deployment)
  - [Smart Contracts](#smart-contracts-1)
  - [Frontend](#frontend-1)
- [Usage](#usage)
  - [For Developers](#for-developers)
  - [For End-Users](#for-end-users)
- [Future Plans](#future-plans)
- [Contributing](#contributing)
- [License](#license)

## Introduction
Real-world asset (RWA) tokenization involves converting physical or traditional financial assets—such as real estate, art, commodities, or equities—into digital tokens on a blockchain. This process enhances efficiency, liquidity, and accessibility by enabling fractional ownership and seamless trading. OnlyAssets simplifies this by providing a user-friendly platform where asset owners can mint tokens representing their assets and list them for sale, while investors can browse and purchase these tokens securely.

The platform addresses key challenges in traditional asset markets, such as high transaction costs, limited liquidity, and restricted access to high-value assets. By using the Sui blockchain, known for its high throughput and low latency, OnlyAssets ensures fast and secure transactions.

## Workflow
The following steps outline the process for tokenizing and trading real-world assets on OnlyAssets:

1. **Admin Deployment and Configuration**:
   - The admin deploys the smart contracts to the Sui blockchain using the Sui CLI.
   - The admin initializes the marketplace by calling functions in `admin.move` to set up parameters and roles.

2. **Issuer Verification and Registration**:
   - Potential issuers submit verification details (e.g., KYC documents) to the admin.
   - The admin reviews and approves issuers, adding them to the registry via `issuer_registry.move`.
   - For each issuer, the admin sets a minting cap to limit token issuance.

3. **Asset Token Minting**:
   - Verified issuers mint tokens using `rwa_asset.move`.
   - Unique assets are minted as NFTs, while divisible assets are minted as FTs.
   - Tokens include metadata describing the underlying asset for transparency.

4. **Listing Tokens on the Marketplace**:
   - Issuers list their tokens on the marketplace using `marketplace.move`, specifying price and payment terms.
   - Listings are visible to users browsing the platform.

5. **Purchasing Tokens**:
   - Users browse the marketplace, select tokens, and purchase them using `marketplace.move`.
   - Upon successful payment, token ownership is transferred to the buyer, and the seller receives funds.

This workflow ensures a secure, transparent, and efficient process for asset tokenization and trading.

## Smart Contracts
OnlyAssets's smart contracts are written in [Move](https://move-language.github.io/move/), a programming language designed for secure and verifiable smart contract development on blockchains like Sui. The contracts are organized into four modules, each serving a distinct purpose.

### admin.move
The `admin.move` module manages the overall control and configuration of the marketplace. Key functionalities include:
- **Initialization**: Sets up the marketplace with initial parameters and admin roles.
- **Admin Management**: Allows the designation of admin addresses with privileged access.
- **Issuer Verification**: Enables the admin to verify and approve issuers, ensuring only trusted entities can mint tokens.

Only the admin can perform critical actions, such as whitelisting issuers or updating marketplace settings.

### issuer_registry.move
The `issuer_registry.move` module handles the registration and management of issuers. Its main features are:
- **Issuer Whitelisting**: Admins can add or remove issuers from the registry, ensuring only verified entities participate.
- **Minting Caps**: Admins set limits on the number or value of tokens each issuer can mint, controlling supply and maintaining trust.

This module ensures that token issuance is restricted to authorized parties, enhancing platform security.

### rwa_asset.move
The `rwa_asset.move` module enables verified issuers to mint tokens representing real-world assets. It supports:
- **NFT Minting**: For unique assets, such as artwork or collectibles, issuers can create non-fungible tokens (NFTs).
- **FT Minting**: For divisible assets, like real estate or company shares, issuers can create fungible tokens (FTs).
- **Metadata Association**: Each token includes metadata linking it to the underlying asset, ensuring transparency.

This module is crucial for digitizing assets and making them available for trading.

### marketplace.move
The `marketplace.move` module facilitates the listing and trading of minted tokens. Its key functions include:
- **Token Listing**: Issuers can list their tokens for sale, specifying price and payment terms (e.g., in SUI tokens).
- **Token Purchase**: Users can buy listed tokens, with ownership transferred securely upon payment.
- **Transaction Security**: Ensures that trades are executed correctly, with funds and tokens transferred only when conditions are met.

This module powers the core trading functionality of the platform.

## Frontend
The frontend of OnlyAssets is built using [React](https://reactjs.org/), providing a modern and intuitive user interface. It includes a landing page that introduces the platform, its features, and guides users to connect their wallets or explore the marketplace. The interface connects to the Sui blockchain using the [Sui JavaScript SDK](https://github.com/MystenLabs/sui/tree/main/sdk), enabling seamless interaction with the smart contracts. The landing page and marketplace allow users to connect their wallets, browse assets, list tokens, and execute purchases with a focus on user experience.

## Installation and Deployment

### Smart Contracts
To deploy the smart contracts on the Sui blockchain, follow these steps:

1. **Install Sui CLI**:
   - Install the Sui CLI by following the [Sui installation guide](https://docs.sui.io/build/install).
   - Ensure you have Rust and other dependencies installed.

2. **Set Up a Sui Wallet**:
   - Create a wallet using `sui client new-address ed25519`.
   - Fund the wallet with SUI tokens from the [Sui faucet](https://sui.directory/) or another source.

3. **Compile the Move Modules**:
   - Navigate to the directory containing the Move modules (e.g., `contracts/`).
   - Run `sui move build` to compile the modules.

4. **Publish the Modules**:
   - Deploy the compiled modules using `sui move publish --gas-budget 10000000`.
   - Note the package IDs and object IDs returned upon successful publication.

### Frontend
To run the frontend locally:

1. **Clone the Repository**:
   - Clone the OnlyAssets repository to your local machine.
   - Navigate to the frontend directory: `cd OnlyAssets/frontend`.

2. **Install Dependencies**:
   - Ensure [Node.js](https://nodejs.org/) is installed.
   - Run `npm install` to install required packages, including the Sui JavaScript SDK.

3. **Configure Environment Variables**:
   - Create a `.env` file in the frontend directory.
   - Add variables such as:
``REACT_APP_SUI_NETWORK=https://fullnode.testnet.sui.io:443
REACT_APP_CONTRACT_ADDRESS=<PACKAGE_ID>``
- Replace `<PACKAGE_ID>` with the actual package ID from contract deployment.

4. **Run the Development Server**:
- Run `npm start` to start the development server.
- Access the application at `http://localhost:3000`.

For production deployment, build the frontend using `npm run build` and host the output on a static site hosting service.

## Usage

### For Developers
Developers can contribute to OnlyAssets by:

- **Interacting with Smart Contracts**:
- Use the Sui CLI to call contract functions, e.g., `sui client call --package <PACKAGE_ID> --module marketplace --function list_token --args <ARGS>`.
- Refer to the [Sui documentation](https://docs.sui.io/) for detailed CLI usage.

- **Extending the Project**:
- Add new features to smart contracts by writing additional Move modules.
- Enhance the frontend by creating new React components or improving existing ones.
- Test changes thoroughly using the Sui testnet before deploying to mainnet.

### For End-Users
End-users can interact with OnlyAssets through the web interface:

1. **Connect Your Wallet**:
- Click "Connect Wallet" and select a compatible wallet, such as [Sui Wallet](https://sui.directory/).

2. **Browse Assets**:
- Navigate to the marketplace to view available asset tokens.
- Use filters to find specific asset types or price ranges.

3. **Purchase a Token**:
- Select a token to view its details, including metadata about the underlying asset.
- Click "Buy Now" and confirm the transaction in your wallet.

4. **Manage Your Assets**:
- Access your profile or wallet section to view owned tokens.
- Choose to hold, sell, or transfer tokens as needed.

## Future Plans
OnlyAssets aims to enhance its functionality with the following features:

- **Dynamic Pricing Models**: Implement bonding curves to adjust token prices based on supply and demand, ensuring fair market value and liquidity.
- **DAO Governance**: Transition admin roles to a decentralized autonomous organization (DAO), allowing token holders to vote on key decisions like issuer verification or fee structures.
- **Compliance Oracles**: Integrate with third-party oracles to verify regulatory compliance, such as KYC/AML checks for users and issuers.
- **Asset-Backed Lending**: Enable users to use tokenized assets as collateral for loans, unlocking liquidity without selling assets.
- **Fractionalization**: Support dividing high-value assets into smaller, affordable fractions to broaden investment opportunities.

## Contributing
We welcome contributions from the community. To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push to your fork.
4. Open a pull request with a detailed description of your changes.

Ensure your code adheres to the project's coding standards and includes appropriate tests.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
