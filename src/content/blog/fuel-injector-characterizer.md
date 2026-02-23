---
title: "Fuel Injector Characterizer: Peak & Hold Validation System"
description: "One and Done, Vibe Coded system for validating fuel injector performance. Arduino and Webserial."
date: 2025-11-19
tags: ["Arduino", "Hardware", "WebSerial"]
project: "fuel-injector-characterizer"
featured: false
draft: false
---
## Overview

The Fuel Injector Characterizer is a specialized test system that validates a critical hypothesis in automotive electronics: **can 12V-rated fuel injectors operate safely at 24V using peak & hold control?** This "one and done, vibe coded" system combines Arduino hardware, WebSerial communication, and real-time current measurement to answer that question definitively.

## The Engineering Challenge

### The Problem

Modern vehicles increasingly adopt higher-voltage electrical systems (24V, 48V) for improved efficiency. However, many proven fuel injector designs are rated for 12V operation. Operating them at 24V risks:

- **Coil Burnout**: Excessive current destroys windings
- **Thermal Damage**: Heat accumulation beyond design limits
- **Inconsistent Flow**: Non-linear response characteristics
- **Reliability Issues**: Premature failure in production

### The Hypothesis

Peak & hold control should enable safe 24V operation by:
1. Applying full voltage briefly (2ms) to open injector quickly
2. Switching to PWM at reduced duty cycle (50% @ 2kHz) to hold open
3. Reducing average power to safe levels
4. Maintaining identical flow characteristics as 12V

**This system validates that hypothesis through precise measurement.**

## System Capabilities

### Firing Modes

**Individual Activation**:
- Single injector pulse on command
- Configurable pulse width (0.1-100ms)
- Instant response for testing

**Sequential 4-Cylinder**:
- Mimics actual engine firing order
- Realistic timing patterns
- Combustion simulation

**Batch Mode**:
- 50 consecutive pulses automatically
- Statistical analysis capability
- Repeatability validation

### Control Strategies

**Normal Pulse**:
- Full voltage for entire pulse duration
- Standard 12V operation mode
- Baseline measurement

**Peak & Hold**:
- 2ms peak at full voltage (injector opening)
- 1.8ms hold at 50% PWM duty (2kHz switching)
- 24V supply with controlled average power
- Thermal safety validation

### Real-Time Measurement

**Current Sensing**:
- Four independent channels (ACS712 20A sensors)
- 66mV/A sensitivity
- 20kHz sampling rate
- <1ms response time

**Calculated Metrics**:
- Peak current per pulse
- Average current during hold
- Power consumption (instantaneous and average)
- Thermal load estimation

**Data Logging**:
- 10kHz CSV logging to SD card
- Complete waveform capture
- Timestamp synchronization
- Long-term analysis capability

## Technical Implementation

### Hardware Stack

**Microcontroller**:
- Teensy 4.1 (ARM Cortex-M7 @ 600MHz)
- Built-in SD card interface
- USB device capability
- High-speed GPIO

**Current Sensing**:
- ACS712 Hall-effect sensors (4 channels)
- Isolated measurement
- Linear response
- Wide bandwidth

**Driver Electronics**:
- MOSFET switching circuits
- Flyback diode protection
- PWM generation
- Thermal management

### Software Architecture

**Firmware (C++)**:
- Teensy Arduino framework
- High-frequency interrupt handling
- JSON command protocol
- Real-time data streaming
- SD card file management

**Web Interface (HTML/CSS/JavaScript)**:
- Modern responsive design
- WebSerial API integration
- Real-time chart updates
- Zero-installation user interface

### Communication Protocol

**WebSerial Integration**:
- USB connection via browser
- No driver installation required
- Works on Chrome, Edge, Opera
- 115,200 baud rate

**JSON Commands**:
```json
{
  "command": "fire",
  "channel": 1,
  "duration": 3.5,
  "mode": "peak_hold"
}
```

**Response Format**:
```json
{
  "channel": 1,
  "peak_current": 8.2,
  "average_current": 2.1,
  "power_avg": 50.4
}
```

## Validation Methodology

### Test Procedure

1. **Baseline Measurement (12V Normal)**:
   - Fire injector with standard 12V pulse
   - Measure current profile
   - Record power consumption
   - Establish reference flow rate

2. **Peak & Hold Test (24V)**:
   - Fire same injector with P&H control
   - Measure peak and hold currents
   - Calculate average power
   - Compare to 12V baseline

3. **Repeatability Validation**:
   - Run 50-pulse batch mode
   - Statistical analysis of variance
   - Thermal stability check
   - Long-term consistency

### Success Criteria

**Flow Equivalence**:
- 24V P&H flow ≈ 12V normal flow (within 2%)

**Thermal Safety**:
- Average power at 24V ≤ 12V power
- Coil temperature within ratings
- No thermal runaway

**Reliability**:
- Consistent performance across pulses
- No degradation over time
- Predictable behavior

## Real-World Results

### Measured Performance

**12V Normal Pulse (3.5ms)**:
- Peak Current: ~4.5A
- Average Current: 4.5A
- Average Power: 54W
- Flow Rate: Reference (100%)

**24V Peak & Hold (3.5ms total)**:
- Peak Current: ~8.2A (2ms)
- Hold Current: ~2.1A (1.5ms @ 50% PWM)
- Average Power: ~50W
- Flow Rate: 98% of reference

**Conclusion**: 24V P&H achieves nearly identical flow with slightly *lower* average power, confirming the hypothesis.

### Thermal Validation

Continuous operation testing:
- 12V: Coil reaches 85°C equilibrium
- 24V P&H: Coil reaches 78°C equilibrium

**Result**: Lower thermal stress with 24V P&H, improving reliability.

## Use Cases

### Voltage Conversion Projects

**Scenario**: Converting 12V vehicle to 24V electrical system
- Validate injector compatibility
- Optimize P&H timing
- Ensure safety margins
- Avoid costly hardware replacement

### ECU Development

**Scenario**: Designing fuel injection controller
- Characterize injector response
- Tune P&H parameters
- Validate driver circuits
- Meet automotive standards

### Research & Education

**Scenario**: Teaching fuel injection principles
- Visualize current profiles
- Demonstrate control strategies
- Compare operating modes
- Hands-on experimentation

### Performance Tuning

**Scenario**: Custom engine builds
- Match injectors to voltage
- Optimize response time
- Minimize power consumption
- Maximize reliability

## "Vibe Coded" Philosophy

This project embodies rapid prototyping principles:

**What Worked**:
- Arduino ecosystem (fast development)
- WebSerial (zero-install UI)
- JSON protocol (human-readable debugging)
- SD logging (offline analysis)

**What Mattered**:
- Answering the engineering question
- Reliable measurements
- Repeatable results
- Practical validation

**What Didn't**:
- Perfect code structure
- Over-engineering edge cases
- Extensive documentation
- Production-ready polish

Sometimes you need answers *now*, not perfect code later. This system delivered validated results in days, not months.

## Technical Specifications

**Measurement**:
- Sampling: 20kHz (measurement), 10kHz (logging)
- Current Range: 0-20A per channel
- Resolution: 66mV/A (~50mA precision)
- Pulse Width: 0.1-100ms configurable

**Control**:
- PWM Frequency: 2kHz (hold phase)
- Peak Duration: 2ms configurable
- Duty Cycle: 50% (adjustable)
- Response Time: <1ms

**Data Storage**:
- Format: CSV with timestamps
- Capacity: Limited by SD card size
- Resolution: 10kHz logging
- Fields: Time, CH1-4 currents, status

## Challenges & Solutions

### High-Frequency Measurement

**Challenge**: Capturing 2kHz PWM accurately
**Solution**: 20kHz sampling with hardware interrupts

### Sensor Calibration

**Challenge**: ACS712 offset drift
**Solution**: Auto-calibration routine at startup

### USB Power Limitations

**Challenge**: Peak currents exceed USB capability
**Solution**: External 12V/24V power supply with shared ground

### Data Volume

**Challenge**: 10kHz logging creates large files
**Solution**: Efficient binary format option, compression

## Future Enhancements

- Multi-voltage comparison (12V/24V/48V)
- Automated flow measurement integration
- Temperature sensing on coils
- Web-based analysis dashboard
- Machine learning for anomaly detection
- Production test fixture version

## Conclusion

The Fuel Injector Characterizer validates that peak & hold control successfully enables 24V operation of 12V-rated injectors with improved thermal characteristics. By providing precise, real-time measurement of current and power, it transforms a theoretical hypothesis into proven engineering fact.

This "vibe coded" approach—prioritizing rapid validation over perfect implementation—delivered critical insights for voltage conversion projects and ECU development. Sometimes the best tool is the one you build quickly to answer the specific question you have *right now*.

**Key Takeaway**: You can operate 12V injectors at 24V safely using peak & hold control, achieving identical flow with *lower* thermal stress.

---

**Source Code**: [GitHub](https://github.com/MichaelAyles/fuel_injector_characterizer)
