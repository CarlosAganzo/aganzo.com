AGANZO.COM — QUICK DEPLOY
==========================

Files
-----
index.html   Main page
styles.css   All styling
favicon.svg  Browser icon
CNAME        Tells GitHub Pages to use aganzo.com

Optional portrait
-----------------
The current page uses a designed "CA" placeholder.

To use a real portrait:
1. Put a file called portrait.jpg in this folder.
2. In index.html, replace the entire:
     <div class="portrait-inner">...</div>
   with:
     <img src="portrait.jpg" alt="Carlos Aganzo" class="portrait-photo">
3. Add this at the end of styles.css:
     .portrait-photo {
       display:block;
       width:100%;
       height:100%;
       object-fit:cover;
       filter:grayscale(12%);
     }

GitHub Pages
------------
1. Create a free GitHub account if you do not already have one.
2. Create a PUBLIC repository, for example: aganzo.com
3. Upload every file in this folder to the root of the repository.
4. Open repository Settings > Pages.
5. Under "Build and deployment":
   Source = Deploy from a branch
   Branch = main
   Folder = /(root)
   Save.
6. Under "Custom domain", enter:
     aganzo.com
   Save.

GoDaddy DNS for aganzo.com
--------------------------
Open GoDaddy > My Products / Domain Portfolio > aganzo.com > DNS.

For the root domain, create these four A records:

Type   Name   Value
A      @      185.199.108.153
A      @      185.199.109.153
A      @      185.199.110.153
A      @      185.199.111.153

Delete any OTHER A records for @ that point to old hosting or GoDaddy parking,
but do not remove MX/TXT records if you use them for email.

Then create:
Type    Name   Value
CNAME   www    YOUR_GITHUB_USERNAME.github.io

Replace YOUR_GITHUB_USERNAME with your actual GitHub username.

Back in GitHub > Settings > Pages:
- Wait until GitHub confirms the DNS check.
- Enable "Enforce HTTPS" when it becomes available.

DNS can take time to propagate.

carlosaganzo.com
----------------
Do NOT build a second site yet.

Once aganzo.com is live, use GoDaddy domain forwarding for carlosaganzo.com:
  https://aganzo.com
Use a permanent (301) redirect if GoDaddy offers that option.

Important
---------
If carlosaganzo.com currently has email, subdomains, or other services attached,
check those DNS records before changing anything.

Editing later
-------------
For small changes:
GitHub repository > click index.html or styles.css > pencil icon > edit > Commit changes.
GitHub Pages republishes the site automatically.
