"""
Security Tests
==============

Tests for the bash command security hooks.
"""

import pytest

from src.security import extract_commands, validate_rm_command, bash_security_hook


class TestExtractCommands:
    """Tests for command extraction."""

    def test_simple_command(self):
        assert extract_commands("ls -la") == ["ls"]

    def test_piped_commands(self):
        assert extract_commands("cat file.txt | grep error") == ["cat", "grep"]

    def test_chained_commands(self):
        assert extract_commands("mkdir test && cd test") == ["mkdir", "cd"]

    def test_semicolon_separated(self):
        assert extract_commands("echo hello; echo world") == ["echo", "echo"]

    def test_complex_command(self):
        cmds = extract_commands("git status && git add . && git commit -m 'test'")
        assert cmds == ["git", "git", "git"]


class TestValidateRm:
    """Tests for rm command validation."""

    def test_simple_rm_allowed(self):
        allowed, reason = validate_rm_command("rm file.txt")
        assert allowed

    def test_rm_rf_blocked(self):
        allowed, reason = validate_rm_command("rm -rf /")
        assert not allowed
        assert "not allowed" in reason

    def test_rm_f_blocked(self):
        allowed, reason = validate_rm_command("rm -f important.txt")
        assert not allowed

    def test_rm_r_blocked(self):
        allowed, reason = validate_rm_command("rm -r directory/")
        assert not allowed


class TestBashSecurityHook:
    """Tests for the main security hook."""

    @pytest.mark.asyncio
    async def test_allowed_command(self):
        result = await bash_security_hook({
            "tool_name": "Bash",
            "tool_input": {"command": "ls -la"}
        })
        assert result == {}

    @pytest.mark.asyncio
    async def test_blocked_command(self):
        result = await bash_security_hook({
            "tool_name": "Bash",
            "tool_input": {"command": "sudo rm -rf /"}
        })
        assert result.get("decision") == "block"

    @pytest.mark.asyncio
    async def test_non_bash_passes_through(self):
        result = await bash_security_hook({
            "tool_name": "Read",
            "tool_input": {"path": "/etc/passwd"}
        })
        assert result == {}

    @pytest.mark.asyncio
    async def test_git_allowed(self):
        result = await bash_security_hook({
            "tool_name": "Bash",
            "tool_input": {"command": "git status && git add ."}
        })
        assert result == {}

    @pytest.mark.asyncio
    async def test_curl_allowed(self):
        result = await bash_security_hook({
            "tool_name": "Bash",
            "tool_input": {"command": "curl https://api.example.com/jobs"}
        })
        assert result == {}
