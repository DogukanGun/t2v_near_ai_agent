"""
Security monitoring and alerting system for real-time threat detection.
"""

import asyncio
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from .security_logger import SecurityLogger, SecurityEventType


class ThreatDetector:
    """Real-time threat detection engine."""

    def __init__(self, time_window: int = 300):  # 5 minutes
        self.time_window = time_window
        self.request_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        self.failed_attempts: Dict[str, deque] = defaultdict(lambda: deque(maxlen=100))
        self.suspicious_patterns: Dict[str, int] = defaultdict(int)
        self.blocked_ips: Set[str] = set()
        self.security_logger = SecurityLogger()

    def add_request(self, client_ip: str, request: Request, response_status: int = 200):
        """Track incoming request for analysis."""
        now = time.time()
        
        # Clean old entries
        self._clean_old_entries(client_ip, now)
        
        # Add current request
        request_data = {
            "timestamp": now,
            "path": request.url.path,
            "method": request.method,
            "status": response_status,
            "user_agent": request.headers.get("user-agent", ""),
        }
        
        self.request_history[client_ip].append(request_data)
        
        # Analyze for threats
        self._analyze_request_patterns(client_ip, request, request_data)

    def add_failed_attempt(self, client_ip: str, attempt_type: str):
        """Track failed authentication/authorization attempts."""
        now = time.time()
        self.failed_attempts[client_ip].append({
            "timestamp": now,
            "type": attempt_type
        })
        
        # Check for brute force attacks
        self._check_brute_force(client_ip)

    def is_blocked(self, client_ip: str) -> bool:
        """Check if IP is currently blocked."""
        return client_ip in self.blocked_ips

    def block_ip(self, client_ip: str, duration: int = 3600):
        """Block IP for specified duration (default 1 hour)."""
        self.blocked_ips.add(client_ip)
        
        # Schedule unblock
        asyncio.create_task(self._unblock_ip_after_delay(client_ip, duration))
        
        self.security_logger.logger.critical(
            f"SECURITY ALERT: IP {client_ip} has been blocked for {duration} seconds"
        )

    async def _unblock_ip_after_delay(self, client_ip: str, delay: int):
        """Unblock IP after specified delay."""
        await asyncio.sleep(delay)
        self.blocked_ips.discard(client_ip)
        self.security_logger.logger.info(f"IP {client_ip} has been unblocked")

    def _clean_old_entries(self, client_ip: str, current_time: float):
        """Remove entries older than time window."""
        cutoff_time = current_time - self.time_window
        
        # Clean request history
        while (self.request_history[client_ip] and 
               self.request_history[client_ip][0]["timestamp"] < cutoff_time):
            self.request_history[client_ip].popleft()
        
        # Clean failed attempts
        while (self.failed_attempts[client_ip] and 
               self.failed_attempts[client_ip][0]["timestamp"] < cutoff_time):
            self.failed_attempts[client_ip].popleft()

    def _analyze_request_patterns(self, client_ip: str, request: Request, request_data: Dict):
        """Analyze request patterns for suspicious activity."""
        requests = list(self.request_history[client_ip])
        
        if len(requests) < 2:
            return
        
        # Check for rapid-fire requests (potential DoS)
        if len(requests) >= 100:  # 100 requests in 5 minutes
            recent_requests = [r for r in requests if time.time() - r["timestamp"] < 60]  # Last minute
            if len(recent_requests) >= 50:  # 50 requests per minute
                self._trigger_alert(
                    client_ip, 
                    request,
                    "rapid_fire_requests",
                    f"50+ requests in last minute from {client_ip}"
                )
        
        # Check for path scanning
        unique_paths = set(r["path"] for r in requests[-20:])  # Last 20 requests
        if len(unique_paths) >= 15:  # Accessing many different paths
            self._trigger_alert(
                client_ip,
                request,
                "path_scanning",
                f"Accessed {len(unique_paths)} different paths recently"
            )
        
        # Check for error rate patterns
        recent_errors = [r for r in requests[-10:] if r["status"] >= 400]
        if len(recent_errors) >= 8:  # 8 out of last 10 requests failed
            self._trigger_alert(
                client_ip,
                request,
                "high_error_rate",
                f"High error rate: {len(recent_errors)}/10 requests failed"
            )
        
        # Check for suspicious user agents
        user_agent = request_data["user_agent"].lower()
        suspicious_agents = ["sqlmap", "nikto", "nmap", "scanner", "bot", "crawler"]
        if any(agent in user_agent for agent in suspicious_agents):
            self._trigger_alert(
                client_ip,
                request,
                "suspicious_user_agent",
                f"Suspicious user agent: {user_agent}"
            )

    def _check_brute_force(self, client_ip: str):
        """Check for brute force attack patterns."""
        recent_failures = [
            attempt for attempt in self.failed_attempts[client_ip]
            if time.time() - attempt["timestamp"] < 600  # Last 10 minutes
        ]
        
        if len(recent_failures) >= 10:  # 10 failed attempts in 10 minutes
            self.block_ip(client_ip, 3600)  # Block for 1 hour
            
            self.security_logger.log_security_event(
                SecurityEventType.AUTHENTICATION_FAILURE,
                None,  # No request object available
                details={
                    "reason": "brute_force_detected",
                    "client_ip": client_ip,
                    "failed_attempts": len(recent_failures),
                    "time_window": "10_minutes"
                },
                severity="CRITICAL"
            )

    def _trigger_alert(self, client_ip: str, request: Request, alert_type: str, message: str):
        """Trigger security alert."""
        self.security_logger.log_security_event(
            SecurityEventType.SUSPICIOUS_REQUEST,
            request,
            details={
                "alert_type": alert_type,
                "message": message,
                "client_ip": client_ip
            },
            severity="ERROR"
        )
        
        # Consider blocking for repeated offenses
        self.suspicious_patterns[client_ip] += 1
        if self.suspicious_patterns[client_ip] >= 3:  # 3 different suspicious patterns
            self.block_ip(client_ip, 1800)  # Block for 30 minutes


class SecurityMonitoringMiddleware(BaseHTTPMiddleware):
    """Middleware for real-time security monitoring and threat detection."""

    def __init__(self, app, enable_monitoring: bool = True):
        super().__init__(app)
        self.enable_monitoring = enable_monitoring
        self.threat_detector = ThreatDetector() if enable_monitoring else None
        self.security_logger = SecurityLogger()

    async def dispatch(self, request: Request, call_next):
        """Monitor requests and detect security threats."""
        if not self.enable_monitoring:
            return await call_next(request)
        
        client_ip = request.client.host if request.client else "unknown"
        
        # Check if IP is blocked
        if self.threat_detector.is_blocked(client_ip):
            from fastapi import HTTPException
            
            self.security_logger.log_security_event(
                SecurityEventType.SUSPICIOUS_REQUEST,
                request,
                details={
                    "reason": "blocked_ip_access_attempt",
                    "client_ip": client_ip
                },
                severity="WARNING"
            )
            
            raise HTTPException(
                status_code=403,
                detail="Access denied due to security policy"
            )
        
        # Process request
        start_time = time.time()
        
        try:
            response = await call_next(request)
            
            # Track successful request
            if client_ip != "unknown":
                self.threat_detector.add_request(client_ip, request, response.status_code)
            
            # Monitor response time for DoS detection
            response_time = time.time() - start_time
            if response_time > 10.0:  # Very slow response
                self.security_logger.log_security_event(
                    SecurityEventType.SUSPICIOUS_REQUEST,
                    request,
                    details={
                        "reason": "slow_response",
                        "response_time": response_time,
                        "potential_dos": True
                    },
                    severity="WARNING"
                )
            
            return response
            
        except Exception as e:
            # Track failed request
            if client_ip != "unknown":
                error_status = getattr(e, "status_code", 500)
                self.threat_detector.add_request(client_ip, request, error_status)
                
                # Track authentication/authorization failures
                if error_status in [401, 403]:
                    self.threat_detector.add_failed_attempt(
                        client_ip, 
                        "auth_failure" if error_status == 401 else "authz_failure"
                    )
            
            raise

    def get_security_stats(self) -> Dict:
        """Get current security monitoring statistics."""
        if not self.enable_monitoring:
            return {"monitoring": "disabled"}
        
        return {
            "blocked_ips": list(self.threat_detector.blocked_ips),
            "suspicious_patterns_count": dict(self.threat_detector.suspicious_patterns),
            "active_clients": len(self.threat_detector.request_history),
            "monitoring_window": f"{self.threat_detector.time_window} seconds"
        }