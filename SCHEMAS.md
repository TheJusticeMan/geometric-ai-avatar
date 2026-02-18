# JSON Schemas

The LLM must adhere to these schemas to ensure the AvatarEngine can render the input.

## Character Schema

```json
{
  "id": "string",
  "version": "1.0",
  "elements": [
    {
      "type": "circle|polygon",
      "id": "unique-id",
      "z-index": "number",
      "coordinates": { "cx": 0, "cy": 0, "r": 0 } | { "points": [[x,y], [x,y]] },
      "style": { "fill": "hex", "stroke": "hex", "opacity": 0-1 }
    }
  ]
}
```

## Animation Schema

```json
{
  "targetId": "unique-id",
  "property": "points|radius|transform|color",
  "timeline": [
    { "offset": "0%", "value": "initial" },
    { "offset": "100%", "value": "target" }
  ],
  "easing": "string",
  "loop": "boolean"
}
```
