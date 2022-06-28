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

## Powering up

Git aliases can shorten our common command and flag combos -- but wait, there's more!  Aliases can also reference shell commands. Take for example the following:

```bash
# List the available aliases when your memory starts to slip
aliases = "!git config -l | grep ^alias\\. | cut -c 7- | sort"
```

Notice the bang or exclamation mark `!` -- this notifies git that everything following it will be a shell command. In this case we pipe our configuration, extract those starting with `alias.` and list them alphabetically.

Shell functions are also supported.  Take for example the following alias which sets the default branch for `origin`:

```bash
# Sets the default branch for a remote
set-default = "!f() { name=${1-main}; git remote set-head origin $name; git symbolic-ref refs/remotes/origin/HEAD; };f"
```

This can be hard to read if you're not familiar with the syntax, so let's break this down --
- `!` is our indicator that we're issuing a shell command
- `f() { ... };f` creates a function and executes it
- `name=...` creates a local variable named `name`
- `name=${1-main}` assigns our variable `name` the value of the first argument or default to "main" if no argument was supplied 
- `git remote set-head origin $name` sets the default branch for origin to our variable value from `name`
- `git symbolic-ref refs/remotes/origin/HEAD` prints the now default branch as a verification

We can now run `git set-default my-branch` which will track the branch "my-branch" as the default branch for origin (more on how this may be helpful [later](#default-alias)). If we were to run `git set-default` then we'd track `main` as the default branch since no branch name was provided in the first argument.

## My favorite aliases

### Git lists

The way you list things in git can vary depending on what you want to list. For example, if you want to list your local branches you'd use `branch -l`.  If you want to list your stashes you'd use `stash list`. For me, using pluralization is more intuitive, so I created aliases for `branches` and `stashes`:

```bash
branches = branch -l
stashes = stash list
```

### Branch naming

The group I work with has chosen a ...er, unique naming standard that they try to follow. Part of the fun is the rules for how branches are named are all over the place.  Feature branches for instance are formatted as `feature/{name}`, work tasks for tracked from the feature in story branches `story/{story-#}-{name}`.  Meanwhile, hotfixes for production must follow `hotfixes/h-{ticket-#}-{name}`. Hotfix branches naming is extremely finicky, as it's very easy to use the singular "hotfix" or forget the "h-" prefix -- both of which result in the build not running.  To try to tame this madness I've added the following:

```bash
# git feature my-feature-name => feature/my-feature-name
feature = "!f() { NAME=${1}; git checkout -b feature/$NAME; };f"

# git story my-story-name 51120 => story/51120-my-story-name
story = "!f() { WORKNUM=${2-'000'}; NAME=${1-'story-name'}; git checkout -b story/$WORKNUM-$NAME; };f"

# git hotfix my-bug-name 5110 => hotfixes/h-5110-my-bug-name
hotfix = "!f() { WORKNUM=${2-'000'}; NAME=${1}; git checkout -b hotfixes/h-$WORKNUM-$NAME; };f"
```

While this is tailored to adhere to my teams wacky requirements, this is pretty easily modified to meet your own needs.

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

## Tradeoffs & Pitfalls

Everything has a price and aliases are no different. There is a real danger to relying on them _too much_. Repetition is a huge part of learning. Hiding that complexity behind an alias and removing that repetition means you could be learning to use the alias rather than the command and argument behind it fooling yourself into thinking you know more than you actually do. It's a proven fact that programming interviews are the worst, so it's not much of a stretch to imagine being asked to demonstrate a simple git command on a whiteboard -- only to realize you only remember that very personal alias and not the actual git command!
