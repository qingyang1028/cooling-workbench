# Corvane Equipment Monitoring

A bilingual React prototype for investigating a cooling-loop failure in a GPU hall. The walkthrough supports the decision to prioritize loop 3 for investigation while keeping the network switch errors unconfirmed.

[Live demo in English](https://cooling-workbench.pages.dev/?lang=en) · [中文版](https://cooling-workbench.pages.dev/?lang=zh) · [Design system](https://cooling-workbench.pages.dev/design-system/?lang=en) · [中文说明](README.zh-CN.md)

## Design decision

Operators need to decide which equipment to investigate first. The interface brings together the P3 pump-stop alert, cooling-loop and rack relationships, and GPU temperature evidence to support that decision.

The fault overview displays a suggested relationship generated from the prototype’s predefined scenario. The links between the switch alerts and the cooling fault remain unconfirmed. At 03:06, the interface displays the exercise’s confirmed cause; earlier snapshots show only the information available at those times.

## Run locally

Requires Node.js 22.12+ or 24 and npm. From this directory:

~~~sh
npm ci
npm run dev
~~~

Open the local URL printed by Vite. For a production build, run `npm run build`. Use `npm run preview` to preview the generated `dist` directory.

## Walkthrough

1. The page opens at 02:40 with the P3 pump alert. Choose 02:43 or 02:52 in Scenario snapshot to see alerts accumulate.
2. Select loop 3 to inspect pump speed, coolant flow and supporting evidence. Select rack R21, then R21-G01 in the GPU popover to review temperature, training throughput and alerts.
3. Return to loop 3 and select **Mark loop 3 for priority investigation**, then confirm the simulated action. Click an empty area to return to the fault overview.
4. Open SW-A or SW-B from the alert summary or table. Their locations and links to the cooling fault remain unconfirmed. Select 03:06 to see the exercise's confirmed cause and training job failures.

The interface language can be changed at the top right. The language parameter `?lang=en` or `?lang=zh` opens the corresponding version. Screenshots of the walkthrough are in `docs/`.

## Mock data

`src/scenario.js` generates the same 340 records each time, preserving the six exercise starter records and adding 334 simulated records. These include one pump stop, 300 GPU temperature warnings, 17 training slowdowns, 20 fan records and two network port errors.

Cooling loops 1–4 each serve ten racks, with 30 GPU slots per rack. The scenario assumes a rack fan alert when five distinct GPUs in that rack have reported high temperatures, and adds a reminder after five minutes. Gauge ranges, thresholds and training throughput are demo assumptions. Snapshots only include records available by the selected time. The 03:06 review is shown only at that snapshot.

## Implementation

Built with React, Vite and Ant Design. `src/ConsoleUI.jsx` contains shared interface components, `src/tokens.css` defines visual tokens, and `src/locale.js` stores paired Chinese and English strings. The design-system page in `public/design-system/` contains static snapshots and must be updated when the referenced styles or screenshots change.

The app uses simulated data and actions. It does not connect to equipment or persist investigation actions. Production use would require verified telemetry, alert lifecycle and device relationships, access controls, auditing and validation with operators.

The operator portrait is an illustrative photo by [Michael Dam on Unsplash](https://unsplash.com/photos/closeup-photography-of-woman-smiling-mEZ3PoFGs_k).
