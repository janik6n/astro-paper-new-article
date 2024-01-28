#!/usr/bin/env node

import {mkdir, readFile, stat, writeFile} from 'fs/promises';
import chalk from 'chalk';
import GithubSlugger, {slug} from 'github-slugger';
import { checkbox, confirm, input } from '@inquirer/prompts';

const logError = async (message) => {
  const error = chalk.bold.red;
  console.log(`❌ ${error(message)}`);
}

const logSuccess = async (message) => {
  const success = chalk.bold.green;
  console.log(`✅ ${success(message)}`);
}

const logWarning = async (message) => {
  console.log(`⚠️  ${message}`);
}

const logInfo = async (message) => {
  console.log(message);
}

const createContentDirectory = async (path) => {
  try {
    await stat(path);
    await logWarning(`Content directory ${path} already exists.`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await logInfo(`Content directory ${path} does not exist, creating...`);
      await mkdir(path, { recursive: true });
      await logSuccess(`Content directory ${path} created successfully!`)
    } else {
      await logError(`Error creating content directory ${path}: ${err}`);
      process.exit(1);
    }
  }
}

const createArticle = async (articleDirectory, articleFileName, content) => {
  try {
    await stat(articleDirectory);
  } catch (err) {
    await logError(`Directory (${articleDirectory}) for articles does not exist: ${err}`);
    process.exit(1);
  }
  try {
    await stat(`${articleDirectory}/${articleFileName}`);
    await logError(`The article ${articleDirectory}/${articleFileName} already exists!`);
    process.exit(1);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await logInfo(`File ${articleDirectory}/${articleFileName} does not exist, creating...`);
      await writeFile(`${articleDirectory}/${articleFileName}`, content);
      await logSuccess(`Article ${articleDirectory}/${articleFileName} created successfully!`)
    } else {
      await logError(`Error creating blog article ${articleDirectory}/${articleFileName}: ${err}`);
    }
  }
}

(async () => {
  // Read custom tags data from package.json in the project root directory
  const packageJson = JSON.parse(
    await readFile(
      new URL(`${process.cwd()}/package.json`, import.meta.url)
    )
  );

  // Current date to YYYY-MM-DD
  const today = new Date().toISOString().slice(0, 10);
  const contentDirectoryBasePath = `${process.cwd()}/${packageJson.astroNewArticle.contentPath}`;
  let contentDirectory = ``;
  const articleDirectory = `${process.cwd()}/${packageJson.astroNewArticle.blogPath}`;

  // Query inputs from user
  const data = {};
  data.articleTitle = await input({ message: 'Title for the new article:' });
  data.articleDate = await input({
    message: 'Date for the new article (YYYY-MM-DD):',
    default: today
  });
  data.createContentDirectory = await confirm({ message: 'Create content directory for images?' });
  data.featured = await confirm({ message: 'Will this be a featured article?' });
  data.draft = await confirm({ message: 'Will this be a draft?' });

  let tagChoices = [];
  for (let i = 0; i < packageJson.astroNewArticle.proposedTags.length; i++) {
    tagChoices.push({
      "name": packageJson.astroNewArticle.proposedTags[i],
      "value": packageJson.astroNewArticle.proposedTags[i]
    });
  }
  data.tags = await checkbox({ message: 'Tags:', choices: tagChoices });

  // Start processing inputs

  data.articleSlug = slug(data.articleTitle);
  data.ogImage = packageJson.astroNewArticle.defaultOgImage;

  // Determine the desired format for the content directory
  if (packageJson.astroNewArticle.contentSubDirectory == 'date') {
    data.contentDirectory = `${contentDirectoryBasePath}/${data.articleDate}`;
    contentDirectory = data.articleDate;
  } else if (packageJson.astroNewArticle.contentSubDirectory == 'slug') {
    data.contentDirectory = `${contentDirectoryBasePath}/${data.articleSlug}`;
    contentDirectory = data.articleSlug;
  } else {
    await logInfo(``);
    await logWarning(`Config for contentSubDirectory is missing, defaulting to date`);
    data.contentDirectory = `${contentDirectoryBasePath}/${data.articleDate}`;
  }

  // tags array to string
  let tagsString = `\n`;
  for (let i = 0; i < data.tags.length; i++) {
    tagsString = tagsString.concat(`  - ${data.tags[i]}\n`);
  }


  const content = `---\n` +
    `author: ${packageJson.astroNewArticle.author}\n` +
    `pubDatetime: ${data.articleDate}\n` +
    `title: ${data.articleTitle}\n` +
    `description: ${data.articleTitle}\n` +
    `slug: ${data.articleSlug}\n` +
    `ogImage: ${data.ogImage}\n` +
    `featured: ${data.featured}\n` +
    `draft: ${data.draft}\n` +
    `tags: ${tagsString}---\n\n## Table of contents\n\n## Intro\n\nHello, this is an image reference ![picture-here](@assets/${contentDirectory}/picture-here.png)`;

  await logInfo(``);

  if (data.createContentDirectory === true) {
    await createContentDirectory(data.contentDirectory);
  }
  await logInfo(``);
  await createArticle(articleDirectory, `${data.articleSlug}.md`, content);
  await logInfo(``);
  await logSuccess(`Article ready, time to start writing! 🚀`);
})();
