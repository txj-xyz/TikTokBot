# TikTok Bot
Links posted in Discord messages are automatically parsed and the video data is fetched directly from TikTok. You do not need to worry about keeping the TikTok link a specific format since the parser logic will take care of that for you.

### Requirements
```
> Node.JS ^v16.x
> Discord.JS ^v13.x
> Typescript ^v4.x
```
### Installation

Use the package manager [npm](https://npmjs.org/) to install the dependencies.

```bash
npm i
```
If you wish to install each module manually, here is the list
```bash
npm i discord.js dotenv tiktok-scraper typescript
```

### Usage / Running the bot

**1.)** Run `git clone https://github.com/txj-xyz/TikTokBot` to clone to repo to your local system.

**2.)** Open the folder (or `cd` into the directory) and rename the `.env_example` file to `.env` (Make sure to fill out the required information in this file).

**3.)** Once the token in inserted into the `.env` file you can run `npm start` to start the bot.

See the list below for different run configurations:
```asciidoc
Start with NPM :: npm start
Start with PM2 :: pm2 start npm run start
Start with Docker :: docker build . -t tiktok:latest && docker run --name TikTok tiktok:latest
```

### Contributing

Pull requests are welcome. Please test your changes before pulling.
