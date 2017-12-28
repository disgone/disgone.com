---
author: "Alexis Tacnet"
date: 2014-09-28
title: Example article
---

## Text

**This is some text.** Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut pretium at ipsum eu pharetra. Proin ac ante et leo ultrices bibendum. Vivamus id ipsum fermentum, aliquam nunc mollis, tempus sapien. Praesent scelerisque cursus eros vitae pretium. Etiam sit amet ligula in leo euismod malesuada. Proin eleifend pulvinar ipsum, eu lobortis ante pharetra eu. Vivamus sem elit, venenatis eget ornare nec, ullamcorper non tellus. Duis quis massa finibus, euismod erat quis, fermentum nunc. Maecenas euismod felis sit amet convallis placerat.

## Images

**This theme includes a tranparent way to defer images. This can be enabled/disabled in the `config.toml`.**

![image](http://lorempixel.com/400/200/sports/)

**You will just have to do two images : the normal, and a low resolution one.**

## Code

This is some code, this theme includes language highlight, optionnal as well.

```css
.dark {
  color: #333333 !important;
}
.light {
  color: #666666 !important;
}
.accent {
  color: #428bca !important;
}
```

Here's some json

```json
{
    "ProviderId": 600,
    "ChargeTypeCode": "FUEL_COST_ADJUSTMENT_SERVICE_AREA",
    "ChargeData": "[{\"ServiceArea\":\"Kanto\",\"Amount\":-3.1,\"Currency\":\"JPY\",\"ChargeTypeCd\":\"CHG_FCA\"},{\"ServiceArea\":\"Chubu\",\"Amount\":-4.08,\"Currency\":\"JPY\",\"ChargeTypeCd\":\"CHG_FCA\"},{\"ServiceArea\":\"Kansai\",\"Amount\":-2.47,\"Currency\":\"JPY\",\"ChargeTypeCd\":\"CHG_FCA\"}]",
    "StartDate": "2018-01-01T00:00:00",
    "EndDate": null,
    "RequestedByUser": "AMBIT\\shsmith",
    "RequestedByApp": "charge-update"
}
```

And a dash of C#

```csharp
using System;
using System.Collections.Generic;
using System.Net.Http;

namespace Octokit.Internal
{
    public interface IRequest
    {
        object Body { get; set; }
        Dictionary<string, string> Headers { get; }
        HttpMethod Method { get; }
        Dictionary<string, string> Parameters { get; }
        Uri BaseAddress { get; }
        Uri Endpoint { get; }
        TimeSpan Timeout { get; }
        string ContentType { get; }
    }
}
```
