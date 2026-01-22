import { END, MemorySaver, START, StateGraph } from "@langchain/langgraph";
import { FraudAgentState } from "./utils/state.js";
import { applyRiskRules, draftAssessment, makeDecision } from "./utils/node.js";

// Create the graph
const workflow = new StateGraph(FraudAgentState)
  // Add nodes with appropriate error handling
  .addNode("applyRiskRules", applyRiskRules)
  .addNode("draftAssessment", draftAssessment)
  .addNode("makeDecision", makeDecision)
  // Add only the essential edges
  .addEdge(START, "applyRiskRules")
  .addEdge("applyRiskRules", "draftAssessment")
  .addEdge("draftAssessment", "makeDecision")
  .addEdge("makeDecision", END);
// Compile with checkpointer for persistence
const memory = new MemorySaver();
export const fraudAgent = workflow.compile({ checkpointer: memory });
