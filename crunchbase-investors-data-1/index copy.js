const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const investors_json = require("./data.json");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

let scrape = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 10,
  });

  const loginPage = await browser.newPage();

  await loginPage.goto("https://www.crunchbase.com/login");
  await loginPage.waitForTimeout(2000);
  await loginPage.waitForSelector("login");
  await loginPage.type("input[name=email]", "Kixile3886@sofrge.com");

  await loginPage.type("input[name=password]", "Kixile3886@sofrge.com");
  await loginPage.waitForTimeout(2000);
  await loginPage.keyboard.press(String.fromCharCode(13));
  await loginPage.waitForNavigation({
    waitUntil: "load",
  });

  const page2 = await browser.newPage();
  await page2.setDefaultNavigationTimeout(0);
  await page2.goto("https://www.facebook.com/");
  let results = [];
 
  for (let i = 0, total_urls = investors_json.length; i < total_urls; i++) {
    try {
      
        let investorData = {
          summary: {
            about: {},
            overview: {},
            personalInvesments: {},
            jobs: {},
            details: {}
          }
        };

        /*
        
        await page2.click("body > chrome > div > mat-sidenav-container > mat-sidenav-content > div > ng-component > entity-v2 > page-layout > div > div > div > page-centered-layout.ng-star-inserted > div > div > div.main-content > row-card:nth-child(2) > profile-section > section-card > mat-card > div.section-content-wrapper > div > list-card > div > table > tbody > tr:nth-child(1) > td:nth-child(2) > field-formatter > identifier-formatter > a");
        const data = await page2.evaluate((investorData) => {
           // Details
      const mainContent = document.querySelector('.main-content')
			const textValueContent = mainContent.querySelectorAll('ul.text_and_value li')

			textValueContent.forEach(elem => {
				let label = elem.querySelector('.wrappable-label-with-info').innerText
				const value = elem.querySelector('field-formatter').innerText

				label = camelize(label)

				investorData.summary.details[label] = value
			});
        }, investorData)
         */

      
      results = results.concat(await getInfo(page2, investors_json[i], investorData));

     
    } catch (e) {
      console.log(e);
    }
  }

  await browser.close();
  return results;
};

const getInfo = async (page, url, investorData) => {
  try { 
    await page.goto(url, { waitUntil: "load" });
    const data = page.evaluate(async (investorData) => {
      function camelize(str) {
				return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
					return index === 0 ? word.toLowerCase() : word.toUpperCase();
				}).replace(/\s+/g, '');
			};

      

      const fullName =
        document.querySelector(
          "body > chrome > div > mat-sidenav-container > mat-sidenav-content > div > ng-component > entity-v2 > page-layout > div > div > profile-header > div > header > div > div > div > div.identifier-nav > div.identifier-nav-title.ng-star-inserted > h1"
        )?.innerText || "";
      const bigValues = document.querySelectorAll(
        "body > chrome > div > mat-sidenav-container > mat-sidenav-content > div > ng-component > entity-v2 > page-layout > div > div > div > page-centered-layout.ng-star-inserted > div > div > div.main-content > row-card:nth-child(1) > profile-section > section-card > mat-card > div.section-content-wrapper > div > .ng-star-inserted > .ng-star-inserted"
      );
      const secondValues = document.querySelectorAll(
        "body > chrome > div > mat-sidenav-container > mat-sidenav-content > div > ng-component > entity-v2 > page-layout > div > div > div > page-centered-layout.ng-star-inserted > div > div > div.main-content > row-card:nth-child(1) > profile-section > section-card > mat-card > div.section-content-wrapper > div > .ng-star-inserted > ul > li"
      );
      const description =
        document.querySelector(
          "body > chrome > div > mat-sidenav-container > mat-sidenav-content > div > ng-component > entity-v2 > page-layout > div > div > div > page-centered-layout.ng-star-inserted > div > div > div.main-content > row-card > profile-section > section-card > mat-card > div.section-content-wrapper > div > description-card"
        )?.innerText || "";

      investorData.summary.about.fullName = fullName;
      investorData.summary.about.description = description;

      bigValues.forEach((element) => {
        try {
          let label = element.querySelector("label-with-info")?.innerText;
          let info = element.querySelector("field-formatter")?.innerText;

          investorData.summary.overview[label] = info;
        } catch (e) {
          console.log(e);
        }
      });

      secondValues.forEach((element) => {
        try {
          let label = element.querySelector("label-with-info")?.innerText;
          let info = element.querySelector("field-formatter")?.innerText;
          investorData.summary.overview[label] = info;
        } catch (e) {
          console.log(e);
        }
      });

      //Personal Invesments
      const all_personal_invesments = document.querySelectorAll(
        "body > chrome > div > mat-sidenav-container > mat-sidenav-content > div > ng-component > entity-v2 > page-layout > div > div > div > page-centered-layout.ng-star-inserted > div > div > div.main-content > row-card:nth-child(2) > profile-section > section-card > mat-card > div.section-content-wrapper > div > big-values-card > div"
      );
      const personal_invesments_description = document.querySelector(
        "body > chrome > div > mat-sidenav-container > mat-sidenav-content > div > ng-component > entity-v2 > page-layout > div > div > div > page-centered-layout.ng-star-inserted > div > div > div.main-content > row-card:nth-child(2) > profile-section > section-card > mat-card > div.section-content-wrapper > div > phrase-list-card"
      )?.innerText;

      investorData.summary.personalInvesments.description =
        personal_invesments_description;

      all_personal_invesments.forEach((element) => {
        try {
          let label = element.querySelector("label-with-info")?.innerText;
          let info = element.querySelector("field-formatter")?.innerText;
          investorData.summary.personalInvesments[label] = info;
        } catch (e) {
          console.log(e);
        }
      });

      //jobs
      const jobs = document.querySelectorAll(
        "body > chrome > div > mat-sidenav-container > mat-sidenav-content > div > ng-component > entity-v2 > page-layout > div > div > div > page-centered-layout.ng-star-inserted > div > div > div.main-content > row-card:nth-child(3) > profile-section > section-card > mat-card > div.section-content-wrapper > div > big-values-card > div"
      );
      jobs.forEach((element) => {
        try {
          let label = element.querySelector("label-with-info")?.innerText;
          let info = element.querySelector("field-formatter")?.innerText;
          investorData.summary.jobs[label] = info;
        } catch (e) {
          console.log(e);
        }
      });

     
			

      return investorData;
    }, investorData);

    return data;
  } catch (e) {
    console.log(e);
  }
};

scrape().then((value) => {
  console.log(value);

  fs.writeFileSync(
    "./crunchbase//crunchbase-investors-data-1/data/investors-data.json",
    JSON.stringify(value),
    (err) => (err ? console.log(err) : null)
  );
});
