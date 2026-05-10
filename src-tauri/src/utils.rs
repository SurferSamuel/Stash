use chrono::NaiveDate;

pub fn parse_date(date: &str) -> Result<NaiveDate, String> {
    NaiveDate::parse_from_str(date, "%Y-%m-%d")
        .map_err(|_| format!("Could not parse date: {}.", date))
}
