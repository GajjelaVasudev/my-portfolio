# Online Job Recruitment System (Featured Architecture)

## Overview
- **Project Title**: Online Job Recruitment System
- **Role**: Backend & Systems Architect
- **Year**: 2024 — 2025
- **Status**: Completed / Active Repository
- **Repository URL**: https://github.com/GajjelaVasudev/online-job-recruitment
- **Category**: Distributed Microservices Architecture

## Problem Statement
Traditional monolithic job boards struggle with high applicant spikes during campus placement drives or public job postings. A failure in candidate résumé indexing or notification emailing frequently halts applicant submission pipelines entirely.

## Architectural Solution
Engineered a decoupled microservices-based recruitment application designed for independent service resilience, dynamic discovery, and automated candidate evaluation workflows.

## Key Technical Features
- **Service Discovery & Dynamic Routing**: Utilizes Netflix Eureka for runtime service registration and dynamic client-side load balancing.
- **Asynchronous Candidate Ingestion Pipelines**: Uses message queues and decoupled services to ingest and parse applicant résumés without blocking user-facing HTTP threads.
- **Containerized Orchestration**: Packaged with Docker and multi-service Docker Compose networks for reproducible local and cloud deployment.
- **Data Persistence**: Isolated schema databases ensuring applicant records and recruiter analytics do not cross bounded contexts.

## Tech Stack
- **Languages**: Java
- **Frameworks**: Spring Boot, Spring Cloud, Netflix Eureka
- **Infrastructure**: Docker, Docker Compose
- **APIs**: RESTful JSON contracts with error-handling middleware
