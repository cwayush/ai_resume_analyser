# Deterministic ATS Resume Analyzer

<div align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" />
  <img alt="Gemini" src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" />
</div>

<br/>

A production-grade, mathematically deterministic application that evaluates candidate resumes against specific Job Descriptions (JDs). Unlike "black box" AI screening tools, this project strictly separates deterministic algorithm ranking from generative AI feedback—ensuring every score is 100% transparent, identical on repeated runs, and engineered using classic search-engine architecture.

## The Value Proposition

Hiring platforms increasingly rely on opaque ML models to screen candidates, leading to bias and inconsistent outcomes. Job seekers, on the other hand, rarely understand _why_ they were filtered out.

This project solves both problems:

- **For Recruiters:** Provides a mathematical, auditable, and repeatable matching score based on true semantic relevance and keyword density.
- **For Job Seekers:** Extracts the "black box" anxiety by telling candidates exactly which skills are missing, what experience they lack, and providing **Gemini AI-powered coaching** on how to format or rephrase their resume to pass automated screens.

## Key Features

- **Multi-Algorithm Scoring Engine:** Calculates an overall match score utilizing an aggregate of several industry-standard NLP algorithms.
- **AI Career Coach:** Integrates Google's Gemini 2.0 Flash API to generate human-readable feedback and targeted suggestions _without_ altering the underlying deterministic score.
- **Containerized Database:** Fully managed PostgreSQL and Redis environment via Docker, configured via Drizzle ORM.
- **Intelligent Parsing:** Securely extracts unformatted text from uploaded `.pdf` and `.docx` files on the backend.
- **Dynamic Data Visualization:** Utilizes Recharts and Framer Motion on the frontend to display score breakdowns beautifully and intuitively.

## Unique Engineering & Algorithms Used

The core engineering strength of this project is its mathematical precision. The ATS Score is determined completely locally using the following implementations:

- **TF-IDF & Cosine Similarity:** Transforms the resume and the Job Description into mathematical matrices based on word frequency distribution, comparing their multidimensional geometric angles.
- **Okapi BM25:** The industry-standard ranking function used inside Elasticsearch. The project treats the job description as a "Search Query" and mathematically evaluates how highly the resume "Ranks" for that query.
- **Keyword Set Intersection Normalization:** Deploys a massive custom keyword dictionary to normalize skills (e.g. treating `Node.JS`, `NodeJS`, and `Node` as the identical root concept), tracking exact intersections between required vs. optional elements.
- **Regex-Powered Heuristic Filters:** Parses complex, unstructured phrases like _"over 5+ years of professional experience in..."_ to programmatically enforce hard requirement thresholds.
