# MQTT Duration Trigger: Smart Button Press Detection

## Overview

In home automation, many MQTT devices send simple on/off signals without distinguishing between a quick tap and a long press. This Home Assistant custom component bridges that gap by measuring signal duration and classifying button presses, enabling more sophisticated automation triggers.

## The Problem

MQTT-connected devices often publish basic boolean states:
- Button pressed → payload: "1"
- Button released → payload: "0"

While functionally correct, this limits automation possibilities. You can't differentiate between:
- A quick tap (e.g., toggle lights)
- A long press (e.g., trigger a scene)
- Different button combinations

Without duration awareness, you're forced into single-action automations or complex timing workarounds that are unreliable and difficult to maintain.

## The Solution

MQTT Duration Trigger acts as an intelligent middleware layer. It:

1. Subscribes to MQTT input topics
2. Monitors state changes and measures duration
3. Classifies presses as "short" or "long" based on configurable threshold
4. Publishes contextual trigger messages to output topics

This transforms simple on/off signals into meaningful events that Home Assistant can use for advanced automations.

## How It Works

### Configuration

Define topic pairs and a duration threshold in YAML:

```yaml
mqtt_duration_trigger:
  threshold_seconds: 1.0
  topics:
    - input: "zigbee/button1"
      output: "triggers/button1"
      name: "living_room_button"
```

### Processing Logic

1. **Press Detection**: When payload "1" arrives, record timestamp
2. **Duration Calculation**: When payload "0" arrives, calculate elapsed time
3. **Classification**: Compare duration against threshold
4. **Event Publishing**: Send "{name}_short" or "{name}_long" to output topic

### Example Automation

```yaml
automation:
  - alias: "Living Room Button - Short Press"
    trigger:
      platform: mqtt
      topic: "triggers/button1"
      payload: "living_room_button_short"
    action:
      service: light.toggle
      entity_id: light.living_room

  - alias: "Living Room Button - Long Press"
    trigger:
      platform: mqtt
      topic: "triggers/button1"
      payload: "living_room_button_long"
    action:
      service: scene.turn_on
      entity_id: scene.movie_time
```

## Technical Implementation

### Tech Stack
- **Language**: Python (100%)
- **Platform**: Home Assistant Custom Component
- **Protocol**: MQTT
- **Installation**: HACS compatible

### Architecture

The component integrates seamlessly with Home Assistant's MQTT component:

- Subscribes to configured input topics
- Maintains state machines for each monitored button
- Calculates durations with millisecond precision
- Publishes results to separate output topics
- Handles edge cases (missed messages, reconnections)

### Key Features

- Multiple topic pairs supported simultaneously
- Configurable threshold per component instance
- HACS integration for easy installation
- No external dependencies beyond Home Assistant core
- Lightweight resource usage

## Use Cases

### Smart Home Scenarios

**Multi-Function Buttons**:
- Short press: Toggle lights
- Long press: Activate scene

**Doorbell Enhancements**:
- Short press: Normal chime
- Long press: Emergency alert

**Media Controls**:
- Short press: Play/pause
- Long press: Skip track

**Security Systems**:
- Short press: Arm home mode
- Long press: Arm away mode

## Installation

### Via HACS (Recommended)
1. Open HACS in Home Assistant
2. Search for "MQTT Duration Trigger"
3. Install and restart Home Assistant
4. Add configuration to `configuration.yaml`

### Manual Installation
1. Download repository
2. Copy to `custom_components/mqtt_duration_trigger`
3. Restart Home Assistant
4. Configure in `configuration.yaml`

## Benefits

**Simplified Automations**:
- Single component handles timing logic
- Clean, readable automation rules
- Centralized configuration

**Enhanced Control**:
- More functionality from fewer physical buttons
- Intuitive user interactions
- Flexible threshold adjustment

**Reliability**:
- Consistent behavior across devices
- No race conditions or timing issues
- Proper state handling

## Real-World Experience

I use this component throughout my home automation setup:

- Bedroom switches control lights (short) and scenes (long)
- Garage button toggles door (short) or triggers alert (long)
- Dashboard buttons have context-sensitive actions
- Door sensors detect quick opening vs. prolonged states

The configurability means I can tune thresholds based on actual usage patterns—what feels "long" for a wall switch might differ from a handheld remote.

## Future Enhancements

Potential additions include:

- Double-press detection
- Variable thresholds per topic
- Statistics and timing analysis
- Multiple duration tiers (short/medium/long)
- Integration with Home Assistant UI for dynamic configuration

## Conclusion

MQTT Duration Trigger demonstrates how a simple middleware component can unlock significant functionality. By adding intelligence to basic on/off signals, it enables richer automations without requiring hardware changes or complex timing logic in every automation rule.

---

**Source Code**: [GitHub](https://github.com/MichaelAyles/mqtt-duration-trigger)
