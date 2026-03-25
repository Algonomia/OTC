from typing import Optional
import re


def validate_prompt(prompt_text: str, task_type: Optional[str] = None) -> bool:
    """
    Validate prompt syntax and structure
    
    Args:
        prompt_text: The prompt to validate
        task_type: Type of task for specific validation
        
    Returns:
        True if valid
        
    Raises:
        ValueError if invalid
    """
    if not prompt_text or len(prompt_text.strip()) < 50:
        raise ValueError("Prompt too short (min 50 chars)")
    
    if len(prompt_text) > 10000:
        raise ValueError("Prompt too long (max 10000 chars)")
    
    # Check for required sections based on task type
    if task_type == "deadline":
        required_patterns = [
            r"deadline|due date|filing date",
            r"format|structure|output",
            r"extension|grace period"
        ]
        for pattern in required_patterns:
            if not re.search(pattern, prompt_text, re.IGNORECASE):
                raise ValueError(f"Missing required section: {pattern}")
    
    elif task_type == "threshold_penalty":
        required_patterns = [
            r"threshold|limit|minimum|maximum",
            r"penalty|fine|interest|sanction",
            r"currency|amount|percentage"
        ]
        for pattern in required_patterns[:2]:  # At least first 2
            if not re.search(pattern, prompt_text, re.IGNORECASE):
                raise ValueError(f"Missing required section: {pattern}")
    
    # Check for proper formatting
    if "{" in prompt_text and "}" in prompt_text:
        # Ensure balanced braces for template variables
        if prompt_text.count("{") != prompt_text.count("}"):
            raise ValueError("Unbalanced template braces")
    
    return True