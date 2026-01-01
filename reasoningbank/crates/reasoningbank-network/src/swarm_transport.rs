//! # Swarm Transport Layer
//!
//! Integration with ruv-swarm-transport for WebSocket and SharedMemory
//! communication in distributed swarm architectures.
//!
//! ## Features
//!
//! - **WebSocket Transport**: Real-time bidirectional communication
//! - **SharedMemory Transport**: Zero-copy inter-process communication
//! - **WASM Support**: Browser and Node.js compatible transport
//! - **Swarm Coordination**: Multi-agent message routing

use ruv_swarm_transport::websocket::WebSocketTransport;
use ruv_swarm_transport::shared_memory::SharedMemoryTransport;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::{NetworkError, Result};

/// Swarm transport configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SwarmTransportConfig {
    /// Transport type (websocket, shared_memory, auto)
    pub transport_type: TransportType,
    /// WebSocket URL for remote connections
    pub ws_url: Option<String>,
    /// Shared memory segment name
    pub shm_name: Option<String>,
    /// Buffer size for messages
    pub buffer_size: usize,
    /// Enable compression
    pub compression: bool,
    /// Maximum concurrent connections
    pub max_connections: usize,
}

impl Default for SwarmTransportConfig {
    fn default() -> Self {
        Self {
            transport_type: TransportType::Auto,
            ws_url: None,
            shm_name: None,
            buffer_size: 65536,
            compression: true,
            max_connections: 100,
        }
    }
}

/// Transport type selection
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TransportType {
    /// WebSocket for network communication
    WebSocket,
    /// Shared memory for local IPC
    SharedMemory,
    /// Auto-select based on environment
    Auto,
}

/// Swarm message types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SwarmMessage {
    /// Join swarm request
    Join {
        agent_id: String,
        capabilities: Vec<String>,
    },
    /// Leave swarm notification
    Leave {
        agent_id: String,
    },
    /// Task dispatch
    Task {
        task_id: String,
        target_agent: Option<String>,
        payload: Vec<u8>,
    },
    /// Task result
    Result {
        task_id: String,
        agent_id: String,
        payload: Vec<u8>,
        success: bool,
    },
    /// Memory sync (vector embeddings)
    MemorySync {
        agent_id: String,
        vectors: Vec<Vec<f32>>,
        namespace: String,
    },
    /// Consensus vote
    ConsensusVote {
        proposal_id: String,
        agent_id: String,
        vote: bool,
        signature: Option<Vec<u8>>,
    },
    /// Gossip propagation
    Gossip {
        origin: String,
        hops: u32,
        payload: Vec<u8>,
    },
    /// Heartbeat/keepalive
    Heartbeat {
        agent_id: String,
        timestamp: u64,
    },
}

/// Swarm agent info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SwarmAgent {
    pub id: String,
    pub capabilities: Vec<String>,
    pub status: AgentStatus,
    pub last_heartbeat: u64,
}

/// Agent status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AgentStatus {
    Active,
    Busy,
    Idle,
    Disconnected,
}

/// Swarm transport coordinator
pub struct SwarmTransportCoordinator {
    config: SwarmTransportConfig,
    agents: Arc<RwLock<HashMap<String, SwarmAgent>>>,
    ws_transport: Option<WebSocketTransport>,
    shm_transport: Option<SharedMemoryTransport>,
}

impl SwarmTransportCoordinator {
    /// Create new swarm transport coordinator
    pub fn new(config: SwarmTransportConfig) -> Self {
        Self {
            config,
            agents: Arc::new(RwLock::new(HashMap::new())),
            ws_transport: None,
            shm_transport: None,
        }
    }

    /// Initialize transport layer
    pub async fn initialize(&mut self) -> Result<()> {
        match self.config.transport_type {
            TransportType::WebSocket => {
                self.init_websocket().await?;
            }
            TransportType::SharedMemory => {
                self.init_shared_memory().await?;
            }
            TransportType::Auto => {
                // Try shared memory first for local, then websocket
                if self.config.shm_name.is_some() {
                    self.init_shared_memory().await?;
                } else if self.config.ws_url.is_some() {
                    self.init_websocket().await?;
                } else {
                    return Err(NetworkError::Connection(
                        "No transport configuration provided".to_string()
                    ));
                }
            }
        }
        Ok(())
    }

    async fn init_websocket(&mut self) -> Result<()> {
        let url = self.config.ws_url.as_ref()
            .ok_or_else(|| NetworkError::Connection("WebSocket URL not configured".to_string()))?;

        // WebSocketTransport initialization would go here
        // For now, we'll create a placeholder
        tracing::info!("Initializing WebSocket transport: {}", url);
        Ok(())
    }

    async fn init_shared_memory(&mut self) -> Result<()> {
        let name = self.config.shm_name.as_ref()
            .ok_or_else(|| NetworkError::Connection("SharedMemory name not configured".to_string()))?;

        // SharedMemoryTransport initialization would go here
        tracing::info!("Initializing SharedMemory transport: {}", name);
        Ok(())
    }

    /// Register agent with swarm
    pub async fn register_agent(&self, id: String, capabilities: Vec<String>) -> Result<()> {
        let agent = SwarmAgent {
            id: id.clone(),
            capabilities,
            status: AgentStatus::Active,
            last_heartbeat: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        };

        self.agents.write().await.insert(id, agent);
        Ok(())
    }

    /// Unregister agent from swarm
    pub async fn unregister_agent(&self, id: &str) -> Result<()> {
        self.agents.write().await.remove(id);
        Ok(())
    }

    /// Get all active agents
    pub async fn get_agents(&self) -> Vec<SwarmAgent> {
        self.agents.read().await.values().cloned().collect()
    }

    /// Find agents with capability
    pub async fn find_agents_with_capability(&self, capability: &str) -> Vec<SwarmAgent> {
        self.agents.read().await
            .values()
            .filter(|a| a.capabilities.contains(&capability.to_string()))
            .cloned()
            .collect()
    }

    /// Broadcast message to all agents
    pub async fn broadcast(&self, message: SwarmMessage) -> Result<usize> {
        let agents = self.agents.read().await;
        let count = agents.len();

        // Serialize message
        let _payload = serde_json::to_vec(&message)
            .map_err(|e| NetworkError::Serialization(e))?;

        // Send via transport (placeholder)
        tracing::debug!("Broadcasting to {} agents", count);

        Ok(count)
    }

    /// Send message to specific agent
    pub async fn send_to(&self, agent_id: &str, message: SwarmMessage) -> Result<()> {
        let agents = self.agents.read().await;

        if !agents.contains_key(agent_id) {
            return Err(NetworkError::Connection(format!("Agent {} not found", agent_id)));
        }

        let _payload = serde_json::to_vec(&message)
            .map_err(|e| NetworkError::Serialization(e))?;

        tracing::debug!("Sending message to {}", agent_id);

        Ok(())
    }

    /// Process gossip message (propagate with hop limit)
    pub async fn gossip(&self, message: SwarmMessage, max_hops: u32) -> Result<()> {
        if let SwarmMessage::Gossip { origin, hops, payload } = message {
            if hops >= max_hops {
                return Ok(()); // Stop propagation
            }

            let new_message = SwarmMessage::Gossip {
                origin,
                hops: hops + 1,
                payload,
            };

            self.broadcast(new_message).await?;
        }
        Ok(())
    }

    /// Update agent heartbeat
    pub async fn update_heartbeat(&self, agent_id: &str) -> Result<()> {
        let mut agents = self.agents.write().await;

        if let Some(agent) = agents.get_mut(agent_id) {
            agent.last_heartbeat = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs();
            agent.status = AgentStatus::Active;
        }

        Ok(())
    }

    /// Get transport stats
    pub async fn get_stats(&self) -> SwarmTransportStats {
        let agents = self.agents.read().await;

        SwarmTransportStats {
            active_agents: agents.values().filter(|a| a.status == AgentStatus::Active).count(),
            total_agents: agents.len(),
            transport_type: self.config.transport_type,
        }
    }
}

/// Swarm transport statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SwarmTransportStats {
    pub active_agents: usize,
    pub total_agents: usize,
    pub transport_type: TransportType,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_agent_registration() {
        let config = SwarmTransportConfig::default();
        let coordinator = SwarmTransportCoordinator::new(config);

        coordinator.register_agent(
            "agent-1".to_string(),
            vec!["code-review".to_string(), "testing".to_string()]
        ).await.unwrap();

        let agents = coordinator.get_agents().await;
        assert_eq!(agents.len(), 1);
        assert_eq!(agents[0].id, "agent-1");
    }

    #[tokio::test]
    async fn test_capability_search() {
        let config = SwarmTransportConfig::default();
        let coordinator = SwarmTransportCoordinator::new(config);

        coordinator.register_agent(
            "coder-1".to_string(),
            vec!["coding".to_string(), "python".to_string()]
        ).await.unwrap();

        coordinator.register_agent(
            "tester-1".to_string(),
            vec!["testing".to_string(), "python".to_string()]
        ).await.unwrap();

        let python_agents = coordinator.find_agents_with_capability("python").await;
        assert_eq!(python_agents.len(), 2);

        let coding_agents = coordinator.find_agents_with_capability("coding").await;
        assert_eq!(coding_agents.len(), 1);
    }
}
