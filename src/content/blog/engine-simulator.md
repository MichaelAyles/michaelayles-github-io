---
title: "Engine Simulator: High-Fidelity Diesel Engine Thermodynamics"
description: "Engine Simulator, using physics calculations, currently set up for diesel 6cyl"
date: 2025-11-19
tags: ["JavaScript", "Physics", "Simulation"]
project: "engine-simulator-wip"
featured: false
draft: false
---
## Overview

The Engine Simulator is a web-based thermodynamic modeling tool for diesel engines, providing engineers with detailed cycle analysis, emissions prediction, and ECU calibration visualization. Unlike simplified calculators, this simulator computes high-resolution pressure-volume-temperature relationships at 0.1° crank angle resolution, enabling precise analysis of combustion dynamics and performance optimization.

## The Motivation

As an automotive engineer working with ECUs and engine controls, I needed a tool to:
- Visualize the impact of calibration changes
- Understand thermodynamic trade-offs
- Predict emissions behavior
- Validate tuning strategies

Commercial simulation tools are expensive and often overly complex for quick what-if analysis. This simulator provides essential functionality in an accessible, web-based format.

## Core Capabilities

### Physics-Based Modeling

The simulator implements complete 4-stroke diesel engine thermodynamics:

**Cycle Phases**:
- Intake stroke with valve timing
- Compression with heat transfer
- Power stroke with combustion modeling
- Exhaust stroke with blowdown dynamics

**Calculated Parameters**:
- Cylinder pressure and volume
- Gas temperature and density
- Piston kinematics (position, velocity, acceleration)
- Heat transfer coefficients
- Heat release rate
- Mass flow rates

### Resolution & Accuracy

**7,200 data points per complete cycle** (0.1° resolution) capture:
- Rapid combustion events
- Pressure wave dynamics
- Valve timing effects
- Peak pressure gradients

This high-fidelity approach reveals details impossible with coarse approximations.

### Configurable Parameters

**Engine Geometry**:
- Bore: 50-200mm
- Stroke: 50-200mm
- Compression Ratio: 12-22
- Number of Cylinders: 6 (diesel configuration)

**Operating Conditions**:
- Speed: 500-8000 RPM
- Load: 0-100%

**ECU Control**:
- Injection Timing: 5-35° BTDC
- Fuel Pressure: 1000-2500 bar
- Pilot Injection Quantity: 0-30%
- EGR Rate: 0-40%
- Turbo Boost: 0-3.5 bar
- Wastegate control
- Variable Geometry Turbine (VGT) position

## Output & Visualization

### Performance Metrics

- **Power**: Brake power in kW
- **Torque**: Output torque in Nm
- **BMEP**: Brake mean effective pressure in bar
- **Thermal Efficiency**: Percentage conversion of fuel energy
- **Specific Fuel Consumption**: g/kWh

### Emissions Prediction

- **NOx**: Nitrogen oxides (g/kWh)
- **CO**: Carbon monoxide (g/kWh)
- **HC**: Unburned hydrocarbons (g/kWh)
- **PM**: Particulate matter (g/kWh)

### Interactive Visualizations

**P-V Diagrams**:
- Pressure vs. volume traces
- Compression and expansion curves
- Work area visualization
- Comparison overlays

**Crank Angle Plots**:
- Pressure vs. crank angle
- Temperature profiles
- Heat release rate
- Volume changes
- Piston motion

**Data Tables**:
- 1,440 sampled points
- All calculated parameters
- CSV export capability

**ECU Calibration Maps**:
- 8×7 lookup tables (RPM vs. Load)
- Fuel quantity mapping
- Volumetric efficiency
- Injection timing
- Boost targeting

## Technical Implementation

### Architecture

**Client-Side Only**:
- No server required
- Instant calculations
- Complete privacy
- Offline capable

**Web Worker Pattern**:
- Computations run in background thread
- UI remains responsive during heavy calculations
- Smooth user experience

**Vanilla JavaScript**:
- No external dependencies
- Self-contained implementation
- Fast loading
- Easy deployment

### Calculation Engine

The thermodynamic solver implements:
- Ideal gas equations
- Woschni heat transfer correlation
- Wiebe combustion function
- Multi-zone temperature modeling
- Turbocharger matching

### Export Capabilities

**JSON Format**:
- Complete parameter set
- All results and metrics
- Timestamp for tracking
- Easy parsing for automation

**CSV Export**:
- Full cycle data
- Ready for Excel/MATLAB
- High-resolution points

**PNG Images**:
- Canvas-based chart export
- High-quality graphics
- Presentation ready

## Use Cases

### ECU Calibration Development

**Before Hardware Testing**:
- Predict calibration impact
- Identify optimal injection timing
- Balance performance vs. emissions
- Understand boost requirements

**Trade-Off Analysis**:
- NOx vs. PM (soot-NOx trade-off)
- Efficiency vs. power
- EGR impact on temperatures
- Boost pressure effects

### Education & Training

**Learning Tool**:
- Visualize thermodynamic principles
- Understand 4-stroke cycle
- Explore parameter relationships
- Build intuition for engine behavior

**Classroom Applications**:
- Interactive demonstrations
- Homework assignments
- Project basis
- Concept validation

### Design Exploration

**Engine Sizing**:
- Bore/stroke ratio optimization
- Compression ratio selection
- Displacement targeting

**Component Selection**:
- Turbocharger sizing
- Injector flow requirements
- EGR system capacity

### Documentation

**Technical Reports**:
- Generate charts and data
- Support design decisions
- Validate assumptions
- Communicate results

## Unique Features

### Integrated ECU Maps

Unlike most simulators that output only performance curves, this tool **visualizes complete calibration tables**:
- Fuel quantity vs. RPM and load
- Volumetric efficiency compensation
- Timing advance maps
- Boost target schedules

This bridges simulation and real-world ECU development.

### High-Resolution Cycle Data

The **0.1° crank angle resolution** (7,200 points) exceeds typical needs but enables:
- Knock detection analysis
- Combustion noise prediction
- Injector event timing precision
- Rate-of-pressure-rise limits

### Comprehensive Emissions

Simultaneous NOx, CO, HC, and PM modeling allows **complete emissions analysis** rather than focusing on single pollutants.

### No External Dependencies

The **self-contained implementation** means:
- No licensing concerns
- No cloud services required
- Complete data privacy
- Permanent availability

## Real-World Applications

I use this simulator for:
- **Pre-tuning analysis**: Predict calibration directions before dyno time
- **Education**: Explain diesel combustion to colleagues
- **What-if scenarios**: Quickly explore design alternatives
- **Documentation**: Generate charts for reports

The web format means it's always accessible—no installation, no licenses, just open and run.

## Limitations & Future Work

### Current Limitations

- Single-cylinder model (scaled to 6-cylinder)
- Steady-state only (no transients)
- Simplified combustion model
- No detailed gas exchange modeling

### Planned Enhancements

- Multi-cylinder dynamics
- Transient operation support
- Advanced combustion models
- Turbocharger lag simulation
- Acoustic modeling
- More fuel types (gasoline, alternative fuels)
- Save/load calibration profiles

## Conclusion

The Engine Simulator demonstrates that sophisticated engineering tools don't require expensive software licenses or complex installations. By focusing on essential physics and providing intuitive visualization, it enables engineers and students to understand, predict, and optimize diesel engine behavior directly in their browser.

Whether you're calibrating ECUs, learning thermodynamics, or exploring design alternatives, this simulator provides the insights needed to make informed decisions.

---

**Live Simulator**: [michaelayles.github.io/enginesim](https://michaelayles.github.io/enginesim/)
