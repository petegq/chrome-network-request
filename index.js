const chromeLauncher = require("chrome-launcher");
const chromeRemoteInterface = require("chrome-remote-interface");

async function runApp() {
  // Launch a new Chrome instance
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--disable-gpu", "--headless"],
  });

  // Connect to the Chrome instance using the chrome-remote-interface library
  const client = await chromeRemoteInterface({
    port: chrome.port,
  });

  // Extract the required domains from the client
  const { Page, Network } = client;

  // Enable the required domains
  await Promise.all([Page.enable(), Network.enable()]);

  // Set up a listener for network request events
  Network.requestWillBeSent((params) => {
    console.log(`Request: ${params.requestId} => ${params.request.url}`);
    console.log(params.request);
  });

  // Open a new tab and navigate to the specified URL
  await Page.navigate({ url: "https://example.com" });

  // Wait for the page to finish loading
  Page.loadEventFired(async () => {
    console.log("Page loaded successfully.");

    // Close the client and the Chrome instance after a short delay
    setTimeout(async () => {
      await client.close();
      await chrome.kill();
    }, 2000);
  });
}

runApp().catch(console.error);
