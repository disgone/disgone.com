---
title: "Git aliases for fun and profit"
description: "Using git aliases to streamline your workflow"
date: 2022-06-21T10:51:14-05:00
categories: ["code"]
tags: ["git"]
type: post
---

Odds are if you're using version control today it's probably git. For this post, let's highlight git's support for `aliases` and see how they can be leveraged to supercharge your workflow.

## What is an alias?

Git aliases are a way to create shortcuts or abbreviations for commonly used git [commands](https://git-scm.com/docs/git#_high_level_commands_porcelain). They allow you to define a new command that combines one or more existing git commands or options into a shorter and more convenient one that you can easily remember and use.

You can add aliases to your `.gitconfig` file manually or by using the `git config` command. For example, to create a shortcut for the `checkout` command, use the following:

```bash
# Adds 'co' as an alias for checkout to your global config
git config --global alias.co checkout
```

This sets up the `co` alias for checkout in your global config file. Now you can perform a checkout by typing `git co` instead of `git checkout`. Your inner productivity guru nods approvingly!

After creating an alias with the `config` command, we can open our `.gitconfig` file to view the changes. If you're not sure where your `.gitconfig` file is located, you can use the command `git config --global -e` to open it in your default editor. You should see a new section called `[alias]` with our `co` entry listed below it:

```bash
[alias]
co = checkout
```

In the `.gitconfig` file, the `[alias]` section defines shortcuts that can be used in place of git commands. The format for defining an alias is `<alias-name> = <command [args]>`, which means that `<alias-name>` is equivalent to `<command>`. For example, our co alias is equivalent to the checkout command.

Aliases also support command arguments. Take the command for opening our `.gitconfig` file for editing -- `git config --global -e`. Notice that we have a command `config` as well as two associated arguments `--global` and `-e`. Let's add an alias to make it easier to edit our config file using this command.

Previously we used the git command the `config` to create an alias for us but for this example let's practice adding our alias to our `.gitconfig` manually.

Open up your `.gitconfig` file (`git config --global -e`). Look for the `[alias]` heading in the file. If it doesn't exist, add it as a new section. Under `[alias]` add a new entry for `myconfig = config --global -e` and save your changes. You should have something that looks similar to the following:

```bash
[alias]
# You may see additional entries if you already have existing aliases set up

# Shortcut for opening the .gitconfig file for editing
myconfig = config --global -e
```

Now, whenever we want to edit our `.gitconfig` file manually, instead of typing out `git config --global -e`, all we need to do is use `git myconfig` instead. This will make editing our `.gitconfig` file much easier! Very nice!

These are fairly simple scenarios, let's see what else aliases have to offer.

## Shell support

Git aliases can shorten our common command and flag combos -- but wait, there's more!  Aliases can also reference shell commands. For example, the following alias lists all available aliases when you can't remember them:

```bash
# List the available aliases when your memory starts to slip
aliases = "!git config -l | grep ^alias\\. | cut -c 7- | sort"
```

Notice the use of the bang or exclamation mark `!`. This indicates that everything following it will be a shell command. In this case, we're piping our configuration, extracting the `alias.` entries, and listing them alphabetically.

We can take things a step further with shell support and use shell functions. The following alias sets the default branch which is tracked by `origin`:

```bash
# Sets the default branch for a remote. If no name is specified, use 'main'
set-default = "!f() { name=${1-main}; git remote set-head origin $name; git symbolic-ref refs/remotes/origin/HEAD; };f"
```

This syntax can be a bit tricky to read if you're not familiar with it, so let's break it down.
- `!` indicates that we're issuing a shell command
- `f() { ... };f` creates a shell function named f and immediately executes it.
- `name=...` creates a local variable named `name`
- `name=${1-main}` sets a shell variable named "name" equal to the first argument to the set-default alias (i.e., the branch name passed as an argument to the alias) or, if no argument is provided, to the string "main".
- `git remote set-head origin $name` sets the default branch for the remote named "origin" to the branch specified by the `name` variable.
- `git symbolic-ref refs/remotes/origin/HEAD` prints the [symbolic reference](https://git-scm.com/docs/git-symbolic-ref) to the HEAD branch of the "origin" remote, which should be the branch that was just set as the default.

If you run git set-default my-branch, it will set "my-branch" as the default branch for the "origin" remote. If you run git set-default with no arguments, it will set "main" as the default branch.

## My favorite aliases

### Git lists

When listing items in git, the command syntax can vary. For example, to list your local branches you could use `branch -l`, while to list your stashes you'd use `stash list`. To make the command syntax more natual to remember, you can add plural command aliases to your git configuration.

```bash
branches = branch -l
stashes = stash list --date=human
tags = tag -l
remotes = remote -v
submodules = submodule status
```

### Human logs

Git's `log` command supports about a trillion options and a majority of the time I just want to see basic information such as the commit titles, the author, and when the commit was made. For this, I made myself a
"human friendly" git log alias:

```bash
# Hash (yellow) / Branch (red) / Commit message / Author (blue) / Date (green)
logh = log --pretty=format:"%C(yellow)%h%Cred%d\\ %Creset%s%Cblue\\ [%cn]\\ %Cgreen\\ (%cd)" --decorate --date=local --graph
```

This gives a log output which is pretty easy to scan:

{{< figure title="git logh output" >}}
{{< post-image src="images/git-log.jpg" alt="Git log, with custom formatting" >}}
{{< /figure >}}

### Safer force push

Git's `push -force` option can be a dangerous command that forcefully overwrites the remote branch with your local branch, potentially erasing commits that your co-workers or collaborators have pushed in the meantime.

However, in some rare situations, such as when you accidentally pushed sensitive information and need to remove it from the history, you may need to use `push -force`. In these cases, you can mitigate the risk by using the `--force-with-lease` option instead. This option checks if the remote branch has changed since you last pulled it, and only pushes your changes if there are no new changes on the remote branch. This provides _some_ protection against accidentally overwriting your co-workers' work.

```bash
# Safe-ish git push -f
pushf = push --force-with-lease
```

### Branch naming

The branch naming strategy used by my group is not very intuitive for new members. For instance, feature branches are named as `feature/{name}` and task work done against a feature is tracked as `story/{story-#}-{name}`. Additionally, hotfixes for production are named as `hotfixes/h-{ticket-#}-{name}`, which can be problematic as it's easy to forget the required "hotfixes" plural or the "h-" prefix that triggers the correct CI/CD flow.

To safe a few brain cycles I created the following branch helpers:

```bash
# git feature my-feature-name => feature/my-feature-name
feature = "!f() { NAME=${1}; git checkout -b feature/$NAME; };f"

# git story my-story-name 51120 => story/51120-my-story-name
story = "!f() { WORKNUM=${2-'000'}; NAME=${1-'story-name'}; git checkout -b story/$WORKNUM-$NAME; };f"

# git hotfix my-bug-name 5110 => hotfixes/h-5110-my-bug-name
hotfix = "!f() { WORKNUM=${2-'000'}; NAME=${1}; git checkout -b hotfixes/h-$WORKNUM-$NAME; };f"
```

While this is tailored to adhere to my teams wacky requirements, this is pretty easily modified to meet your own needs.

### Checkpoint + Undo

When writing code, you may sometimes reach a point where you're satisfied with what you've written so far but want to experiment further before making a full commit. This could happen, for example, when you have a working example that still needs some improvement before it can be merged into the main codebase. . To handle this situation, I use "checkpoint" commits.

```bash
# Creates a checkpoint commit with all files -- including untracked
checkpoint = !git add -A && git commit -m 'CHECKPOINT'
    
# Revert the previous commit
undo = reset HEAD~1 --mixed
```

A checkpoint commit captures your progress allowing you to safely make changes built on top of your current progress without fear of losing your place. If things don't work out, you can use `git undo` to roll back to the checkpoint.

If you're happy with the changes and want to promote the checkpoint to a full commit, you can use `git commit -a --amend`.

### <a id="default-helper"></a>Default branch helper

Instead of using hardcoded branch names in aliases, it's better to use a helper to reference the default branch. This practice became particularly helpful with the shift in terminology from 'master' to 'main'. The following alias creates a helper that returns the name of the currently tracked branch:

```bash
default = !git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@'
```

Now `git default` will return the name of the currently tracked branch.

You can switch the default tracked branch using `git remote set-head origin {branch}`. I like to verify after making this change, so I've created the following alias:

```bash
# Sets the branch being tracked as origin/head
# and prints the default branch path after completion.
set-default = "!f() { name=${1-master}; git remote set-head origin $name; git symbolic-ref refs/remotes/origin/HEAD; };f"
```

The `git default` alias can now be used in places where you need to reference the default branch. For example, the following will clean up any local branches which have been merged:

```bash
trim-merged = "!f() { DEFAULT=$(git default); git branch --merged ${1-$DEFAULT} | grep -v \" ${1-$DEFAULT}$\" | xargs git branch -d; };f"
```

If you're working with a team, it's essential to keep up with remote changes. Use the following alias to pull and rebase any remote commits into your local:

```bash
# Pull changes for a branch and rebase them into our working directory
pullin = "!f() { DEFAULT=$(git default); git fetch origin && git rebase origin/${1-$DEFAULT}; };f"
```
