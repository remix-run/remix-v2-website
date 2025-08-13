# Remix v2 Website

## Contributing

If you want to make a contribution

- [Fork and clone](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) this repo
- Create a branch
- Push any changes you make to your branch
- Open up a PR in this Repo

## Setup

Install dependencies

```sh
npm i
```

## Local Development

Now you should be good to go:

```sh
npm run dev
```

## Preview

To preview the pre-rendered production build locally:

```sh
npm run build
npx sirv-cli build/client
```

## Deployment

This site (`main` branch) will be auto-deployed to Github Pages via CI

## CSS Notes

You'll want the [tailwind VSCode plugin](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) for sure, the hints are amazing.

The color scheme has various shades but we also have a special "brand" rule for each of our brand colors so we don't have to know the specific number of that color like this: `<div className="text-pink-brand" />`.

We want to use Tailwind's default classes as much as possible to avoid a large CSS file. A few things you can do to keep the styles shared:

- Avoid changing anything but the theme in `tailwind.config.js`, no special classes, etc.
- Avoid "inline rules" like `color-[#ccc]` as much as possible.
- Silly HTML (like a wrapper div to add padding on a container) is better than one-off css rules.

## Algolia Search

We use [DocSearch](https://docsearch.algolia.com/) by Algolia for our documentation's search. The site is automatically scraped and indexed weekly by the [Algolia Crawler](https://crawler.algolia.com/).

If the doc search results ever seem outdated or incorrect be sure to check that the crawler isn't blocked. If it is, it might just need to be canceled and restarted to kick things off again. There is also an editor in the Crawler admin that lets you adjust the crawler's script if needed.
