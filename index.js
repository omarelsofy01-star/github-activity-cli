const https = require("https");

const username = process.argv[2];

if (!username) {
  console.log("❌ Please provide a GitHub username");
  process.exit(1);
}

const url = `https://api.github.com/users/${username}/events`;

const options = {
  headers: {
    "User-Agent": "node.js",
    "Accept": "application/vnd.github+json"
  }
};

https.get(url, options, (res) => {

  console.log("STATUS:", res.statusCode);

  let data = "";

  res.on("data", chunk => data += chunk);

  res.on("end", () => {

    console.log("RAW PREVIEW:", data.slice(0, 150));

    if (res.statusCode !== 200) {
      console.log("❌ Request failed");
      return;
    }

    if (!data) {
      console.log("❌ Empty response");
      return;
    }

    let events;

    try {
      events = JSON.parse(data);
    } catch (err) {
      console.log("❌ Error parsing data");
      return;
    }

    displayEvents(events);

  });

}).on("error", (err) => {
  console.log("❌ Network error:", err.message);
});

function displayEvents(events) {
  if (!Array.isArray(events) || events.length === 0) {
    console.log("No recent activity found.");
    return;
  }

  events.slice(0, 10).forEach((event) => {
    const repo = event.repo?.name || "unknown repo";
if (event.type === "PushEvent") {
  const commits =
    event.payload?.commits?.length ??
    event.payload?.size ??
    "some";

  console.log(`- Pushed ${commits} commit(s) to ${repo}`);
}

    else if (event.type === "IssuesEvent") {
      console.log(`- Opened a new issue in ${repo}`);
    }

    else if (event.type === "WatchEvent") {
      console.log(`- Starred ${repo}`);
    }

    else {
      console.log(`- ${event.type} in ${repo}`);
    }
  });
}