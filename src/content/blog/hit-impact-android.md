---
title: "HIT Impact Android App: Head Impact Monitoring"
description: "Kotlin Android app project for HIT Impact V1 traumatic brain injury sensors"
date: 2025-11-19
tags: ["Kotlin", "Android", "Hardware"]
project: "hit-impact-android-app"
featured: false
draft: false
---
## Overview

The HIT Impact V1 is a helmet-mounted sensor designed to detect and measure head impacts during sports activities. When the official companion app became unavailable, I developed this open-source Android application to give athletes, coaches, and parents continued access to critical safety data.

## The Problem

Head injuries in sports are a serious concern, particularly in contact sports like football, hockey, and rugby. The HIT Impact V1 sensor provides valuable real-time impact data, but without a functioning companion app, the hardware becomes unusable. When hitrecognition.co.uk stopped hosting the official app, users were left with expensive sensors and no way to access their data.

## The Solution

This Android application restores full functionality to the HIT Impact V1 sensor by providing:

- Wireless Bluetooth connectivity
- Real-time impact data monitoring
- User-friendly visualization
- Both simplified and technical data views
- Complete access to sensor capabilities

## Features

### Wireless Connectivity
The app discovers and pairs with HIT Impact V1 sensors over Bluetooth, establishing a reliable connection for continuous monitoring during practice or competition.

### Real-Time Monitoring
Impact data displays instantly as events occur, allowing coaches and trainers to make immediate decisions about athlete safety.

### Dual View Modes
- **Standard View**: Easy-to-read format for quick assessment
- **Technical View**: Detailed sensor data for in-depth analysis

### Sports Safety Focus
Specifically designed for athletic environments where quick access to impact information can inform critical health and safety decisions.

## Technical Implementation

### Architecture

The app follows Android best practices with a clean architecture:

**Activities**:
- `MainActivity.kt` - Application entry and navigation
- `ScanActivity.kt` - Bluetooth device discovery and pairing
- `ImpactDataActivity.kt` - Impact metrics display
- `RawDataActivity.kt` - Advanced technical data viewer

**Communication Layer**:
- `Bluetooth.kt` - Device communication protocol implementation
- Custom data parsing for HIT Impact sensor format

### Tech Stack

- **Language**: Kotlin (96.5% of codebase)
- **Platform**: Android 5.0 (API 21) minimum
- **Build System**: Gradle with Kotlin DSL
- **Communication**: Bluetooth Classic
- **UI**: Native Android layouts

### Requirements

- Android phone or tablet with Bluetooth
- HIT Impact V1 sensor
- Compatible helmet mounting

## Development Philosophy

The project is open-source (MIT license) with the goal of keeping safety equipment functional and accessible. By reverse-engineering the sensor protocol and publishing the implementation, I ensured that athletes could continue using their investment in head impact monitoring technology.

## Impact & Usage

This app enables:

- **Athletes**: Personal awareness of impact exposure
- **Coaches**: Data-driven substitution decisions
- **Parents**: Peace of mind with objective safety metrics
- **Trainers**: Evidence-based injury prevention strategies

## Future Development

Potential enhancements include:

- Historical data logging and trends
- Multi-sensor support for team monitoring
- Export capabilities for medical review
- Cloud backup and sharing
- Impact threshold alerts

## Challenges

### Bluetooth Protocol
Without official documentation, the sensor communication protocol required reverse engineering through packet analysis and testing.

### Data Interpretation
Converting raw sensor values into meaningful impact metrics required understanding the accelerometer scaling and calibration.

### User Experience
Balancing simplicity for quick field use with detailed technical data for post-activity analysis.

## Conclusion

The HIT Impact Android app demonstrates how open-source development can extend the life of valuable safety equipment. When commercial support disappeared, the community stepped in to ensure that critical sports safety technology remained functional and accessible.

---

**Source Code**: [GitHub](https://github.com/MichaelAyles/hit-impact-android)
