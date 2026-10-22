import assert from "node:assert";
import { generateDevSimulationResponse } from "../lib/ai/assistant-context";

console.log("\n=======================================================");
console.log("DEVYX JARVIS COPILOT ACTION & HANDOFF TEST SUITE");
console.log("=======================================================\n");

// 1. Theme Control
console.log("--- 1. Testing Theme Control Actions ---");
const darkRes = generateDevSimulationResponse("bghit dark mode lila", "darija");
assert(darkRes.actions && darkRes.actions.some(a => a.type === "SET_THEME" && a.payload === "dark"), "Dark mode action dispatched");
console.log("✅ PASSED: SET_THEME (dark) successfully triggered");

const lightRes = generateDevSimulationResponse("dir light mode mode clair", "darija");
assert(lightRes.actions && lightRes.actions.some(a => a.type === "SET_THEME" && a.payload === "light"), "Light mode action dispatched");
console.log("✅ PASSED: SET_THEME (light) successfully triggered");

// 2. Navigation Control
console.log("\n--- 2. Testing In-Browser Navigation Actions ---");
const projRes = generateDevSimulationResponse("werili les projets ta3koum", "darija");
assert(projRes.actions && projRes.actions.some(a => a.type === "NAVIGATE" && a.payload === "/projects"), "Projects navigation action dispatched");
console.log("✅ PASSED: NAVIGATE (/projects) successfully triggered");

const servRes = generateDevSimulationResponse("chouf les services", "darija");
assert(servRes.actions && servRes.actions.some(a => a.type === "NAVIGATE" && a.payload === "/services"), "Services navigation action dispatched");
console.log("✅ PASSED: NAVIGATE (/services) successfully triggered");

// 3. Cost & Timeline Estimator
console.log("\n--- 3. Testing Interactive Cost & Timeline Estimator ---");
const costRes = generateDevSimulationResponse("ch7al y9am un site web Next.js w mobile", "darija");
assert(costRes.actions && costRes.actions.some(a => a.type === "ESTIMATE_CARD"), "ESTIMATE_CARD action dispatched");
assert(costRes.estimate, "Estimate object attached");
assert(costRes.estimate.estimatedCost, "Cost estimate calculated");
assert(costRes.estimate.timeline, "Sprint timeline calculated");
console.log("✅ PASSED: ESTIMATE_CARD generated with cost:", costRes.estimate.estimatedCost, "and timeline:", costRes.estimate.timeline);

// 4. Human Specialist & Telegram Handoff
console.log("\n--- 4. Testing Human Specialist & Telegram Handoff ---");
const humanRes = generateDevSimulationResponse("bghit nahder m3a un ingénieur humain telephone ta3i 0555123456", "darija");
assert(humanRes.handoff && humanRes.handoff.requested === true, "Handoff requested flagged");
assert(humanRes.handoff?.contact && humanRes.handoff.contact.includes("0555123456"), "Client phone number extracted");
assert(humanRes.actions && humanRes.actions.some(a => a.type === "TELEGRAM_HANDOFF"), "TELEGRAM_HANDOFF action dispatched");
console.log("✅ PASSED: Human handoff flagged with extracted contact:", humanRes.handoff?.contact);

console.log("\n=======================================================");
console.log("🎉 ALL JARVIS COPILOT CAPABILITIES VERIFIED (100%)");
console.log("=======================================================\n");
