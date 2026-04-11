# Sweet Delights Bakery CMS Website

A modern, mobile-responsive local bakery website built with pure HTML, CSS, and Vanilla JavaScript. 

This project is fully integrated with **Netlify CMS** (now Decap CMS) using a lightweight, zero-build-step architecture. All website content—including the menu, reviews, and contact information—is stored in localized JSON collections and fetched dynamically on page load. 

This allows non-technical bakery owners to log into an `/admin` UI dashboard and permanently update their website without ever touching the code!

## 🚀 Technologies Used
* HTML5 / Vanilla CSS
* Vanilla JavaScript (Fetch API) 
* Modern Google Fonts (Outfit, Playfair Display)
* Netlify CMS / Git Gateway Authentication

## 💻 Running Locally
Because this architecture uses the `fetch()` API to request the JSON data, you must run it through a local server (Chrome blocks cross-file fetches otherwise). 

The quickest way to run it:
1. Open this repository folder in VS Code.
2. Install the **Live Server** extension.
3. Right click `index.html` and select **Open with Live Server**.

## ☁️ Deployment & Admin Dashboard
This repository is 100% ready to deploy to Netlify. 
1. Link this repository to Netlify via the Dashboard (Leave build settings totally blank!).
2. Go to **Site Settings > Identity** and click **Enable Identity**.
3. Under **Identity > Services**, click **Enable Git Gateway**.
4. Invite yourself as a user via the main Identity tab to set your secure password.
5. Visit `https://<your-deployment-url>.netlify.app/admin` to edit the website!
