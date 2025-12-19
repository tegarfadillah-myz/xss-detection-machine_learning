# SecuriBlog - XSS Vulnerability & WAF Demo

**SecuriBlog** is a purposefully vulnerable Content Management System (CMS) designed to demonstrate Cross-Site Scripting (XSS) attacks and how to mitigate them using a Machine Learning-powered Web Application Firewall (WAF).

## 🚀 Features

### Dual-Mode Architecture
The application features a toggle switch to flip between **Secure** and **Vulnerable** modes instantly.

*   **🛡️ Secure Mode (Default)**
    *   **Architecture**: React Frontend -> Laravel API -> **WAF Middleware** -> Database.
    *   **Protection**: An integrated Naive Bayes Machine Learning model (Python/Flask) inspects all incoming traffic.
    *   **Defense**: Blocks malicious Payloads (XSS) with a `403 Forbidden` response.
    *   **Rendering**: Uses safe React rendering (automatic output encoding).

*   **⚠️ Vulnerable Mode (CTF/Educational)**
    *   **Architecture**: React Frontend -> Laravel API (No Middleware) -> Database.
    *   **Vulnerability**: Accepts all input raw.
    *   **Rendering**: Uses `dangerouslySetInnerHTML`, exposing the app to XSS.

### Exploitable Scenarios
1.  **Stored XSS**: Post comments in "Vulnerable Mode" to inject scripts that execute for all visitors.
2.  **Reflected XSS**: Search queries are reflected back in the UI without sanitization.
3.  **DOM XSS**: The "Breadcrumb" navigation allows injection via URL parameters/Hashes.

## 🛠️ Technology Stack
*   **Frontend**: React.js 18, TailwindCSS, Vite.
*   **Backend**: Laravel 12 (PHP 8.2).
*   **ML Service**: Python 3.9, Flask, Scikit-Learn (Naive Bayes).
*   **Infrastructure**: Docker & Docker Compose.

## 📦 Installation & Setup

### Prerequisites
*   Docker & Docker Compose installed.

### Quick Start
1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/xss-dashboard.git
    cd xss-dashboard
    ```

2.  **Start the services**
    ```bash
    docker compose up -d --build
    ```
    *This will spin up the Laravel App, ML Service, and database.*

3.  **Install Dependencies & Build Frontend**
    ```bash
    docker compose exec app npm install
    docker compose exec app npm run build
    ```

4.  **Run Migrations**
    ```bash
    docker compose exec app php artisan migrate
    ```

5.  **Access the App**
    *   Open [http://localhost:8000](http://localhost:8000) in your browser.

## 🎮 How to Use

### Testing Security (WAF)
1.  Ensure the toggle in the header is set to **SECURE**.
2.  Try to post a comment: `<script>alert('Owned')</script>`.
3.  **Result**: The WAF blocks the request. You should see an error message.

### Testing Vulnerabilities
1.  Switch the toggle to **VULNERABLE**.
2.  **Reflected XSS**:
    *   Type `<img src=x onError=alert('Reflected')>` in the search bar.
    *   Hit Enter. The payload executes immediately.
3.  **Stored XSS**:
    *   Scroll to the comments section.
    *   Post `<img src=x onError=alert('Stored')>`.
    *   Refresh the page. The alert pops up every time.

## ⚠️ Disclaimer
This application contains **intentional security vulnerabilities**. 
*   **DO NOT** deploy this to a public server without authentication or restricting access.
*   **DO NOT** use the "Vulnerable Mode" code in production.

---
*Created for educational purposes.*
