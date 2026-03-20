# DPM (Dance Pattern Mapper)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Expo SDK](https://img.shields.io/badge/Expo-~54.0-blue?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61dafb?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)](https://www.typescriptlang.org)

> **Status:** Work in Progress 🚧

A React Native / Expo mobile app for mapping partner-dance patterns as a prerequisite graph.  
Organise patterns into dance-style-specific lists, visualise their dependencies in a swimlane timeline or a zoomable network graph, and share your lists with other dancers via export/import.

---

## Features

### Pattern Lists
- Create pattern lists for any dance style — choose from **six built-in templates** (West Coast Swing, Salsa, Bachata, Argentine Tango, Lindy Hop) or start from a **blank list**
- Each list owns its own set of **custom pattern types** with individually assigned colours
- Delete lists individually; the active list persists across sessions

### Pattern Management
- Full **CRUD** for patterns within a list
- Per-pattern fields: name, type, counts, level (Beginner / Intermediate / Advanced), description, free-form **tags**, **prerequisite links** to other patterns, and one or more **videos** (local file or URL)
- Inline video thumbnails with a swipeable carousel in both the edit form and the detail view

### Graph Visualisation
Two switchable views driven by the prerequisite graph:

| View | Description |
|---|---|
| **Timeline** | Swimlane layout — one lane per pattern type, patterns flow left-to-right by dependency depth; skip-level edges rendered as curved arcs |
| **Network** | Force-free hierarchical graph with pan & pinch-zoom; nodes coloured by type and shaded by level |

- Tap any node to open a **pattern details modal**
- Collapsible **legend** showing type colours and level shading
- Circular-dependency detection with a warning overlay

### Filtering & Sorting
- Filter by **name** (substring), **type**, **level**, **exact counts**, and **tags**
- Sort by name, type, level, counts, or date created (ascending / descending)
- Both panels slide up as bottom sheets

### Import & Export
- Export selected pattern lists to a **JSON file** with base64-embedded local videos, shared via the native share sheet
- Import a previously exported file: conflict resolution per list (**skip**, **replace**, or import as **new list**)

### Settings
- **Theme**: Light, Dark, or System default
- **Language**: English 🇬🇧 and German 🇩🇪

---

## Tech Stack

| Layer | Library / Version |
|---|---|
| Framework | [Expo](https://expo.dev) ~54 / React Native 0.81 |
| Navigation | [Expo Router](https://expo.github.io/router) + [React Navigation Drawer](https://reactnavigation.org) |
| Persistence | [@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage) |
| Graphics | [react-native-svg](https://github.com/software-mansion/react-native-svg) 15 |
| Video | [expo-video](https://docs.expo.dev/versions/latest/sdk/video) + [expo-video-thumbnails](https://docs.expo.dev/versions/latest/sdk/video-thumbnails) |
| File / Share | [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem) + [expo-sharing](https://docs.expo.dev/versions/latest/sdk/sharing) + [expo-document-picker](https://docs.expo.dev/versions/latest/sdk/document-picker) |
| i18n | [i18next](https://www.i18next.com) + [react-i18next](https://react.i18next.com) |
| Language | TypeScript 5.9 |
| Testing | Jest 29 + ts-jest + @testing-library/react-native |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (LAN mode)
npx expo start

# Or target a specific platform
npx expo start --android
npx expo start --ios
npx expo start --web
```

### Running Tests

```bash
npm test                  # run all tests
npm run test:watch        # watch mode
npm run test:coverage     # generate coverage report
```

## Roadmap

- [ ] Pattern sharing between users (groundwork laid in export/import)
- [ ] Additional dance-style templates
- [ ] EAS / OTA build pipeline
