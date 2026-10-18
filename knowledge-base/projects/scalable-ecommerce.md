# Scalable E-commerce Platform

## Overview
- **Project Title**: Scalable E-commerce Platform
- **Role**: Full-Stack Engineer
- **Year**: 2023 — 2024
- **Repository URL**: https://github.com/GajjelaVasudev
- **Category**: Full-Stack Web Application

## Problem Statement
E-commerce interfaces must balance fast visual rendering with transactional accuracy during concurrent checkout requests, inventory decrementing, and search filtering.

## Architectural Solution
Developed an end-to-end modular digital storefront engineered for transactional consistency, instant catalog search, and resilient shopping cart state synchronization across sessions.

## Key Technical Features
- **Instant Catalog Search & Filtering**: Client-side debounce and indexing for zero-lag product filtering by category, price, and availability.
- **Cart & Checkout State Persistence**: Resilient local and server state persistence preventing cart abandonment during network drops.
- **Transactional Consistency**: Atomic inventory checks on order placement preventing double-booking of stock.
- **High Performance**: Optimized bundle splitting and asset caching achieving a 98 Lighthouse performance score.

## Tech Stack
- **Frontend**: React, TypeScript, Modern CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT with secure HTTP-only cookies
