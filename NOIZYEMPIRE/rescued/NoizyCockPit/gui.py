import streamlit as st
import pandas as pd

st.set_page_config(page_title="NoizyCockpit GUI", layout="wide")
st.title("🧠 NoizyCockpit Dashboard")

# Load account data
try:
    df = pd.read_csv("data/account_alignment.csv")
    st.dataframe(df)
except Exception as e:
    st.warning(f"Could not load account data: {e}")

st.header("Branding Status")
branding_status = {
    "Instagram": {
        "Banner": "updated",
        "Bio": "needs update",
        "Profile Pic": "active"
    },
    "TikTok": {
        "Banner": "missing",
        "Bio": "active",
        "Profile Pic": "needs update"
    }
}
for platform, status in branding_status.items():
    st.subheader(platform)
    for item, state in status.items():
        st.write(f"{item}: {state}")
