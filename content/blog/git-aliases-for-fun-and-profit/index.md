---
title: "Git aliases for fun and profit"
description: "Using git aliases to streamline your workflow"
date: 2022-06-21T10:51:14-05:00
draft: true
categories: ["code"]
tags: ["git", "git-alias"]
type: post
---

Odds are if you're using version control today it's probably git. For this post, let's highlight git's support for `aliases` and see how they can be leveraged to supercharge your workflow.

## What is an alias?

In short, an alias is simply a way to add shorthand syntax for a [command](https://git-scm.com/docs/git#_high_level_commands_porcelain) or set of commands.

Aliases can be added to your `.gitconfig` manually by hand or via the `config` command. As a simple example, lets set up a shortcut for one of the more common commands `checkout` using the `config` command:

```bash
# Adds 'co' as an alias for checkout to your global config
git config --global alias.co checkout
```

Now we can perform a checkout with `git co <branch>` rather than having to fully type out `git checkout <branch>`.  Your inner lazy nods approvingly!  

Let's open our `.gitconfig` file and view the changes that the `config` command made for us.  If you're unsure where your `.gitconfig` file is located have no fear -- `git config --global -e` will open your `.gitconfig` in your default editor. If you're following along you should see an `[alias]` section with our `co` alias added below it:

```bash
[alias]
co = checkout
```

Aliases follow the format `<alias-name> = <command [args]>` which can be read as `<alias-name>` is equivalent to `<command>`. For example, our checkout alias would simply be read as `co` is equivalent to `checkout`.

Aliases also support command arguments. Take the command for opening our `.gitconfig` file for editing -- `git config --global -e`. Notice that we have a command `config` as well as two associated arguments `--global` and `-e`.  Let's add an alias to make it easier to edit our config file using this command.

Previously we used the git command the `config` to create an alias for us but for this example let's practice adding our alias to our `.gitconfig` manually.

Open up your `.gitconfig` file (`git config --global -e`). Find your `[alias]` section. If you're not following along, you may not have an `[alias]` section, so feel free to add it as well. Under `[alias]` add a new alias for `config --global -e` as `myconfig` and save your changes. You should have something to the following:

```bash
[alias]
# existing aliases if you had any
myconfig = config --global -e
```

Now, whenever we want to edit our `.gitconfig` manually, rather than typing out `git config --global -e` all we'll need is use is `git myconfig`. Very nice!

These are fairly simple scenarios, let's see what else aliases have to offer.

## Shell support

Git aliases can shorten our common command and flag combos -- but wait, there's more!  Aliases can also reference shell commands. Take for example the following:

```bash
# List the available aliases when your memory starts to slip
aliases = "!git config -l | grep ^alias\\. | cut -c 7- | sort"
```

Notice the bang or exclamation mark `!` -- this notifies git that everything following it will be a shell command. In this case we pipe our configuration, extract the `alias.` entries, and list them alphabetically.
 
To go a step further, shell support also allows use to use shell functions. The following alias sets the default branch which is tracked by `origin`:

```bash
# Sets the default branch for a remote. If no name is specified, use 'main'
set-default = "!f() { name=${1-main}; git remote set-head origin $name; git symbolic-ref refs/remotes/origin/HEAD; };f"
```

This can be hard to read if you're not familiar with the syntax, so let's break this down --
- `!` is our indicator that we're issuing a shell command
- `f() { ... };f` creates a function and executes it
- `name=...` creates a local variable named `name`
- `name=${1-main}` assigns our variable `name` the value of the first argument or default to "main" if no argument was supplied 
- `git remote set-head origin $name` sets the default branch for origin to our variable value from `name`
- `git symbolic-ref refs/remotes/origin/HEAD` prints the now default branch as a verification

We can now run `git set-default my-branch` which will track the branch "my-branch" as the default branch for origin (more on how this may be helpful [later](#default-helper)). If we were to run `git set-default` then we'd track `main` as the default branch since no branch name was provided in the first argument.

## My favorite aliases

### Git lists

Listing things in git can vary depending on the command. For example, if you want to list your local branches you could use `branch -l`.  If you want to list your stashes you'd use `stash list`. Rather than having to remember these, I find pluralization mor intuitive.

```bash
# List branches by name
branches = branch -l
# List stashes, with a 'human' friendly date as the index.
stashes = stash list --date=human
```

### Human logs

Git's `log` command supports about a trillion options and a majority of the time I just want to see commit titles, the author, and when the commit was made.  For this, I made myself a
"human friendly" git log alias:

```bash
logh = log --pretty=format:"%C(yellow)%h%Cred%d\\ %Creset%s%Cblue\\ [%cn]\\ %Cgreen\\ (%cd)" --decorate --date=local --graph
```

This gives a log output which is pretty easy to scan:

{{< figure title="git logh output" >}}
{{< post-image src="images/git-log.jpg" alt="Git log, with custom formatting" >}}
{{< /figure >}}

### Safer force push

Pushing changes with `-force` can be dangerous and cause your co-workers to hate you. However, in the real world there _are_ situations where using `-force` may not be so bad. Perhaps you pushed a commit only to immediately realize you accidentally included some secrets which should be removed from history. In these situations, we can still provide ourselves (and our co-workers) a little protection by using the safer alternative: `git push --force-with-lease`

`--force-with-lease` is still a force push, however, prior to pushing it will perform a check against remote and only push if the remote is unchanged.  e.g. Force push, but only if no additional changes have been committed.

```bash
# Safe-ish git push -f
pushf = push --force-with-lease
```

### Branch naming

The group I work has a branch naming strategy that is a bit, er,  haphazard for the uninitiated.  Feature branches for instance are formatted as `feature/{name}`, task work done against a feature is tracked as `story/{story-#}-{name}`.  Meanwhile, if there's a hotfix for production, it's formatted as `hotfixes/h-{ticket-#}-{name}` which is especially troublesome because it's so easy to leave "hotfix" singular rather than "hotfixes" or forget that h- prefix -- both of which are required to trigger the correct ci/cd flow.

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

Often I get to a point when writing code where I'm generally happy with what I've written, but I want to experiment a bit.  I try my best to ensure each commit is able to build and run, but perhaps we're not to that point for a full commit.  For these situations I like to use 'checkpoint' commits:

```bash
# Creates a checkpoint commit with all files -- including untracked
checkpoint = !git add -A && git commit -m 'CHECKPOINT'
    
# Revert the previous commit
undo = reset HEAD~1 --mixed
```

Now I can safely make changes built on top of my current progress without fear of losing my place.  If things don't work out I can use `git undo` to roll back, and if things went well and the code is ready I can use `git commit -a --amend` to promote my checkpoint to a full commit.

### <a id="default-helper"></a>Default branch helper

It can be tempting to use hard coded branch names in aliases, but with the shift in terminology to prefer `main` (or anything else really) over `master` this can complicate alias creation.  To help alleviate this, we can use a helper for when we need to reference the default branch.

```bash
default = !git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@'
```

Now `git default` will return the name of the currently tracked branch.

You can change the default tracked branch using `git remote set-head origin {branch}`.  I like to verify after making this change, so I've created the following alias:

```bash
# Sets the branch being tracked as origin/head
# and prints the default branch path after completion.
set-default = "!f() { name=${1-master}; git remote set-head origin $name; git symbolic-ref refs/remotes/origin/HEAD; };f"
```

The `git default` alias can now be used in places where you need to reference the default branch.  For example, the following will clean up any local branches which have been merged:

```bash
trim-merged = "!f() { DEFAULT=$(git default); git branch --merged ${1-$DEFAULT} | grep -v \" ${1-$DEFAULT}$\" | xargs git branch -d; };f"
```

If you're working on a team it's a good idea to keep up with remote changes.  `git pullin` will pull rebase any remote commits into your local:

```bash
# Pull changes for a branch and rebase them into our working directory
pullin = "!f() { DEFAULT=$(git default); git fetch origin && git rebase origin/${1-$DEFAULT}; };f"
```
