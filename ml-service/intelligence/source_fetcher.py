"""
PAIMANA-INTEL — Secure Source Fetcher & Web Sanitizer
Protects against SSRF, dangerous protocols, and content bloat.
Extracts clean plain text snippets with content deduplication hashing.
"""

import re
import socket
import ipaddress
import hashlib
import logging
from typing import Optional, Dict, Tuple
from urllib.parse import urlparse

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger("source_fetcher")


class SecurityException(Exception):
    """Raised when an untrusted URL triggers SSRF or protocol guards."""
    pass


class SourceFetcher:
    """
    Hardened HTTP fetcher for external evidence extraction.
    Enforces SSRF isolation, content size limits, timeout, and text sanitization.
    """

    MAX_BYTES = 1024 * 1024  # 1 MB maximum content per page
    DEFAULT_TIMEOUT = 8      # 8 seconds timeout
    ALLOWED_SCHEMES = {"http", "https"}

    def __init__(self):
        self.session = requests.Session()
        retries = Retry(
            total=2,
            backoff_factor=0.5,
            status_forcelist=[429, 500, 502, 503, 504],
            raise_on_status=False
        )
        adapter = HTTPAdapter(max_retries=retries)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 (PAIMANA-Evidence-Extractor/1.0)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9"
        })

    def validate_url(self, url: str) -> None:
        """Enforces security boundaries against private network SSRF and dangerous protocols."""
        if not url or not isinstance(url, str):
            raise SecurityException("URL must be a non-empty string.")

        parsed = urlparse(url)
        if parsed.scheme.lower() not in self.ALLOWED_SCHEMES:
            raise SecurityException(f"Unsupported or dangerous scheme '{parsed.scheme}'. Only HTTP/HTTPS allowed.")

        hostname = parsed.hostname
        if not hostname:
            raise SecurityException("URL missing hostname.")

        # Localhost and cloud metadata protections
        if hostname.lower() in {"localhost", "127.0.0.1", "::1", "169.254.169.254", "0.0.0.0"}:
            raise SecurityException(f"Access to loopback/metadata target '{hostname}' is forbidden.")

        # Resolve hostname and check IP ranges
        try:
            ip_str = socket.gethostbyname(hostname)
            ip = ipaddress.ip_address(ip_str)
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
                raise SecurityException(f"Target '{hostname}' resolves to private/internal IP {ip_str}.")
        except socket.gaierror:
            # Domain resolution failed
            pass

    def fetch(self, url: str) -> Optional[Tuple[str, str, str]]:
        """
        Fetches web page and extracts clean sanitized text.
        Returns: (clean_text, content_hash, canonical_url) or None if error.
        """
        try:
            self.validate_url(url)
        except SecurityException as sec_err:
            logger.warning(f"Security block on URL '{url}': {sec_err}")
            return None

        try:
            resp = self.session.get(
                url,
                timeout=self.DEFAULT_TIMEOUT,
                stream=True,
                allow_redirects=True
            )

            if resp.status_code != 200:
                logger.debug(f"Fetch failed with HTTP {resp.status_code} for {url}")
                return None

            # Read bounded content
            raw_bytes = resp.raw.read(self.MAX_BYTES + 1)
            if len(raw_bytes) > self.MAX_BYTES:
                raw_bytes = raw_bytes[:self.MAX_BYTES]

            content_hash = hashlib.sha256(raw_bytes).hexdigest()

            # Decode safely
            encoding = resp.encoding or "utf-8"
            try:
                html_text = raw_bytes.decode(encoding, errors="replace")
            except Exception:
                html_text = raw_bytes.decode("utf-8", errors="replace")

            # Basic HTML strip
            clean_text = self.extract_clean_text(html_text)
            canonical_url = resp.url or url

            return clean_text, content_hash, canonical_url

        except Exception as e:
            logger.debug(f"Error fetching URL '{url}': {e}")
            return None

    @staticmethod
    def extract_clean_text(html: str) -> str:
        """Removes script tags, styles, and extracts readable text paragraphs."""
        # Strip script and style blocks
        text = re.sub(r'<script.*?</script>', ' ', html, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r'<style.*?</style>', ' ', text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r'<nav.*?</nav>', ' ', text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r'<header.*?</header>', ' ', text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r'<footer.*?</footer>', ' ', text, flags=re.DOTALL | re.IGNORECASE)

        # Strip remaining HTML tags
        text = re.sub(r'<[^>]+>', ' ', text)

        # Clean whitespace
        text = re.sub(r'[\r\n\t]+', ' ', text)
        text = re.sub(r'\s{2,}', ' ', text).strip()
        return text
