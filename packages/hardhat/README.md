# Victim Compensation Fund

### Introduction

This repo contains work completed towards the submission of the IntelliDAO's Encode x Polygon Hackathon project. This project is a dApp for crowdfunding private investigations and asset recovery operations, conducted by the IntelliDAO, towards the aim of providing victims of financial crime access to the capital required to purchase these services. This will serve the IntelliDAO's impact mission of helping victims of fraud and protecting web3 from financial crime. Crowdfunding will be made available to all victims seeking to access either the DAO's private investigations and asset recovery service or, alternatively, any parter firm's PI services.   

### Architecture

This project consists of three core smart contract modules. The first is the crowdfunding module remniscent of www.GoFundMe.org which allows victims to request funds from the DAOs members and contributors. The second is the rev-share contracts which allocate a portion of a given investigation and subsequent asset recovery process. The third and final is the special unique NFT granted to donors which will feature unique algorithmically generated digital art infusing the victims data into a novel expression of the DAO's mission and principles. These NFTs will grant access to DAO governance processes and special, exclusive donor only areas of the DAO. Finally, the project will include a dApp frontend developed with NextJS and Material UI React.

#### Crowdfunding
The crowdfunding smart contracts will facilitate the transfer of funds from platform donors to the service provider of choice associated with the victims request. The process of victim crowdfunding includes accepting donations before allocating capital to a request specific escrow contract, like LexLocker. The next phase of this process involves transfering the funds raised, which are held in this escrow contract, to the victim's private investigator of choice.

To reward donors in the platform, a revenue sharing contract will return funds donated in the case of a successfull asset recovery operation to donors, as well as allocate the DAO's fee to the DAO Treasury and the remainder to the victim. Finally, donors will receive a special investigational NFT and be acknowledged within the IntelliDAO's Discord channel, on all social media channels, including the Lens Protocol, and also granted access to DAO governance processes.

#### Revenue Sharing

When the revenue sharing module is fully tested a single DAO wide allocator contract will be deployed. It will be configured for all agreement types, including crowdfunding campaigns, service provider commissions on DAO referals, and/or instructor to DAO to distributor payments, when the mintAgreement function is called. At the time a campaign is successful, for example, the campaign's escrow contract will release funds to the service provider, then, make an external call to the allocator contract to mint an agreement. This agreement will include the type of agreement, the address of each recipient, and the weight of each distribution (% of revenue), as well as the source contract address. The ID of the agreement will be returned as output and later used to mint the donor NFT rewards.

#### Donor NFT Reward

Donor NFT rewards will include a seriies utility functions providing them with intrinsic value determining the eventual sales price at time of sale, should the owner decide to sell it. This includes the utility of access to and participation in exclusive DAO member areas related and governance processes for the crowdfunding platform. Token holders will be welcome to particpate in the token gated "Donors" channel category in the IntelliDAO Discord server. Additionally, discounts on DAO-related merchandise and in-person hackathon tickets will be provided through the DAO website.

#### dApp Frontend

The dApp frontend will be built with NextJS and Material UI React. We will integrate with the three core smart contract modules and provide users with the means to both donate to campaigns, send funds raised to service providers, and collect their reward NFTs and eventual share of the resultant revenue. the IntelliDAO Discord server, crwodfunding related governance access, merchandise discounts, and hackathon ticketing discounts will be out of scope for this interface. That being said, we will document these interfaces for both devs and users. Given additional time following the dApp frontend's completion, we will begin incrementally implementing these critical components of the IntelliDAO's operational infrastructure.

### Attribution

[clr.fund](https://github.com/clrfund/monorepo/tree/develop/contracts/contracts)
