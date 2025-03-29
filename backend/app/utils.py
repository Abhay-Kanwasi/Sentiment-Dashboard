import pandas as pd
from typing import Optional

def validate_csv(df: pd.DataFrame) -> Optional[str]:
    """
        Validate that the CSV file has the required structure.
        Returns an error message if validation fails, None otherwise.
    """
    # Check if 'review' column exists
    if 'review' not in df.columns:
        return "CSV file must contain a 'review' column"
    
    # Check if file is empty
    if df.empty:
        return "CSV file is empty"
    
    # All validations passed
    return None