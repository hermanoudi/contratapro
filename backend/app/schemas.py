# backend/app/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import time, date, datetime

# Subscription Plan Schemas
class SubscriptionPlanBase(BaseModel):
    name: str
    slug: str
    price: float
    max_services: Optional[int] = None
    can_manage_schedule: bool = False
    can_receive_bookings: bool = False
    priority_in_search: int = 0
    trial_days: Optional[int] = None

class SubscriptionPlanResponse(SubscriptionPlanBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ChangePlanRequest(BaseModel):
    new_plan_slug: str

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str
    is_professional: bool = False

    # Profile Data
    cpf: Optional[str] = None
    cep: Optional[str] = None
    street: Optional[str] = None
    number: Optional[str] = None
    complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    whatsapp: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    cpf: Optional[str] = None
    whatsapp: Optional[str] = None
    cep: Optional[str] = None
    street: Optional[str] = None
    number: Optional[str] = None
    complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None

class UserResponse(UserBase):
    id: int
    slug: Optional[str] = None
    is_active: bool
    is_professional: bool
    is_admin: bool
    is_suspended: bool
    subscription_status: str  # Campo essencial para verificar status da assinatura
    cpf: Optional[str] = None
    cep: Optional[str] = None
    street: Optional[str] = None
    number: Optional[str] = None
    complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    whatsapp: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    profile_picture: Optional[str] = None

    # Dados do plano
    subscription_plan_id: Optional[int] = None
    subscription_plan: Optional[SubscriptionPlanResponse] = None
    trial_ends_at: Optional[datetime] = None
    subscription_started_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProfessionalPublic(BaseModel):
    id: int
    name: str
    slug: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    whatsapp: Optional[str] = None
    profile_picture: Optional[str] = None
    services: List["ServiceResponse"] = []
    working_hours: List["WorkingHourResponse"] = []
    subscription_plan: Optional[SubscriptionPlanResponse] = None
    average_rating: Optional[float] = None
    total_reviews: int = 0

    class Config:
        from_attributes = True

class ProfessionalSearchResult(BaseModel):
    """Schema para resultados de busca — sem working_hours (não usado nos cards)"""
    id: int
    name: str
    slug: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    whatsapp: Optional[str] = None
    profile_picture: Optional[str] = None
    services: List["ServiceResponse"] = []
    subscription_plan: Optional[SubscriptionPlanResponse] = None
    average_rating: Optional[float] = None
    total_reviews: int = 0

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Service Schemas
class ServiceBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: Optional[float] = None
    duration_type: str = 'hourly'  # 'hourly' ou 'daily'

class ServiceCreate(ServiceBase):
    pass

class ServiceResponse(ServiceBase):
    id: int
    professional_id: int
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Working Hour Schemas
class WorkingHourBase(BaseModel):
    day_of_week: int
    start_time: time
    end_time: time

class WorkingHourCreate(WorkingHourBase):
    pass

class WorkingHourResponse(WorkingHourBase):
    id: int
    professional_id: int
    
    class Config:
        from_attributes = True

# Appointment Schemas
class AppointmentBase(BaseModel):
    date: date
    start_time: time
    end_time: time

class AppointmentCreate(BaseModel):
    date: date
    service_id: int
    professional_id: int
    start_time: Optional[time] = None  # Opcional para serviços diários
    end_time: Optional[time] = None    # Opcional para serviços diários

class AppointmentStatusUpdate(BaseModel):
    status: str
    reason: Optional[str] = None

class ManualBlockCreate(BaseModel):
    date: date
    start_time: time
    end_time: time
    reason: Optional[str] = "Bloqueio manual"

class AppointmentResponse(AppointmentBase):
    id: int
    client_id: int
    professional_id: int
    service_id: Optional[int] = None  # Opcional para bloqueios manuais
    status: str
    reason: Optional[str] = None
    is_manual_block: bool = False
    client_name: Optional[str] = None # Enriched field
    client_whatsapp: Optional[str] = None # Enriched field
    client_street: Optional[str] = None # Enriched field
    client_number: Optional[str] = None # Enriched field
    client_complement: Optional[str] = None # Enriched field
    client_neighborhood: Optional[str] = None # Enriched field
    client_city: Optional[str] = None # Enriched field
    client_state: Optional[str] = None # Enriched field
    client_cep: Optional[str] = None # Enriched field
    client_email: Optional[str] = None # Enriched field
    professional_name: Optional[str] = None # Enriched field
    professional_category: Optional[str] = None # Enriched field
    professional_whatsapp: Optional[str] = None # Enriched field
    professional_street: Optional[str] = None # Enriched field
    professional_number: Optional[str] = None # Enriched field
    professional_complement: Optional[str] = None # Enriched field
    professional_neighborhood: Optional[str] = None # Enriched field
    professional_city: Optional[str] = None # Enriched field
    professional_state: Optional[str] = None # Enriched field
    professional_cep: Optional[str] = None # Enriched field
    service_title: Optional[str] = None # Enriched field
    service_duration_type: Optional[str] = None # Enriched field
    whatsapp_link: Optional[str] = None # Link para contato via WhatsApp

    class Config:
        from_attributes = True

class AppointmentPagination(BaseModel):
    items: List[AppointmentResponse]
    total: int
    page: int
    size: int
    pages: int

    class Config:
        from_attributes = True


# Notification Schemas
class NotificationBase(BaseModel):
    type: str
    channel: str
    title: str
    message: str

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    appointment_id: Optional[int] = None
    status: str
    created_at: datetime
    sent_at: Optional[datetime] = None
    error_message: Optional[str] = None

    # Campos enriquecidos do appointment
    appointment_date: Optional[date] = None
    appointment_start_time: Optional[time] = None
    service_title: Optional[str] = None
    professional_name: Optional[str] = None
    client_name: Optional[str] = None

    class Config:
        from_attributes = True

class NotificationPagination(BaseModel):
    items: List[NotificationResponse]
    total: int
    page: int
    size: int
    pages: int

    class Config:
        from_attributes = True

# Review Schemas
class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    customer_name: str

class ReviewResponse(BaseModel):
    id: int
    appointment_id: int
    professional_id: int
    rating: int
    comment: Optional[str] = None
    customer_name: str
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewCommentResponse(BaseModel):
    rating: int
    comment: Optional[str] = None
    customer_name: str
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewsSummaryResponse(BaseModel):
    average_rating: Optional[float] = None
    total_reviews: int = 0
    latest_comments: List[ReviewCommentResponse] = []

    class Config:
        from_attributes = True
