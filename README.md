# astro-paper-new-article

Scaffold new blog post for [Astro-based](https://astro.build/) blog using theme [Astro Paper](https://github.com/satnaing/astro-paper).

## Installation

In your blog project, install package using npm:
```bash
npm install astro-paper-new-article --save-dev
```

## Configuration

Scaffolding uses custom configuration in root-level `package.json`. Add the following configuration block:

```json
"astroNewArticle": {
  "blogPath": "src/content/blog",
  "contentPath": "src/assets",
  "contentSubDirectory": "slug",
  "author": "Demo Writer",
  "defaultOgImage": "http://[domain-here]/demo.jpg",
  "proposedTags": [
    "Azure",
    "AWS",
    "Node.js",
    "Python",
    "serverless"
  ]
}
```

Parameters:

- blogPath: Path to markdown files for blog (this should not require changes).
- contentPath: Path to local images etc. for blog articles (this should not require changes). Scaffolding will create a directory in here, defaulting to date (see below parameter)
- contentSubDirectory: `date` or `slug`. Option date will create `2023-04-08` and `slug` will use *the article name slug* as directory name (e.g. "Demo article" > `demo-article`).
- author: Author's name.
- defaultOgImage: Default OG image to be used.
- proposedTags: Which tags are selectable while scaffolding.

Most of these will affect to generated frontmatter.

## Usage

After installing the package and adding the required configuration, on the project root-level run & follow the prompt:
```bash
npx new-article
```

Optionally you can add this also to `scripts` in `package.json`, for example `"new": "new-article"`. Then you can run `npm run new`.

## Changelog

[CHANGELOG](https://github.com/janik6n/astro-paper-new-article/blob/main/CHANGELOG.md)

MIT License. Copyright janik6n.
