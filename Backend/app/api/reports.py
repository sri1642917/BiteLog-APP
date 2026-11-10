from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.report import ReportResponse
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("", response_model=ReportResponse)
def get_report(
    period: str = Query("weekly", description="day, weekly, monthly, quarterly, 6months, or yearly"),
    target_date: Optional[str] = Query(None, description="Optional target date YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    return ReportService.generate_report(db, period=period, target_date=target_date)

@router.get("/download-csv")
def download_report_csv(
    period: str = Query("weekly", description="day, weekly, monthly, quarterly, 6months, or yearly"),
    target_date: Optional[str] = Query(None, description="Optional target date YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    csv_content = ReportService.generate_csv(db, period=period, target_date=target_date)
    filename = f"BiteLog_Report_{period.lower()}_{date.today().isoformat()}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

