---
title: rate
subtitle: Rate
type: Non-built-in widgets
---

A quick rating operation on something.

## Import module

Non-built-in modules, Should be import `RateWidgetModule` in [json-schema.module.ts](https://github.com/ng-alain/ng-alain/blob/master/src/app/shared/json-schema/json-schema.module.ts#L11).

## API

### schema

| Property | Description | Type | Default |
|----------|-------------|------|---------|
| `[maximum]` | star count | `number` | `5` |
| `[multipleOf]` | `0.5` indicates allow semi selection | `number` | `0.5` |

### ui

| Property | Description | Type | Default |
|----------|-------------|------|---------|
| `[allowClear]` | whether to allow clear when click again | `boolean` | `true` |
| `[autoFocus]` | get focus when component mounted | `boolean` | `false` |
| `[text]` | Reminder text template, `{{value}}` indicates the current value | `string` | - |
| `[tooltips]` | Customize tooltip by each character | `string[]` | `[]` |
