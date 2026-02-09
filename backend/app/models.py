# backend/app/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Time, Date, Float, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    slug = Column(String(50), unique=True, nullable=False, index=True)
    price = Column(Float, nullable=False)
    max_services = Column(Integer, nullable=True)  # NULL = ilimitado
    can_manage_schedule = Column(Boolean, default=False)
    can_receive_bookings = Column(Boolean, default=False)
    priority_in_search = Column(Integer, default=0)  # 0=normal, 1=alta
    trial_days = Column(Integer, nullable=True)  # Apenas para trial
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacionamento
    users = relationship("User", back_populates="subscription_plan")
    subscriptions = relationship("Subscription", back_populates="plan", foreign_keys="[Subscription.plan_id]")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    slug = Column(String, unique=True, nullable=False, index=True)
    group = Column(String, nullable=False)
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=True)  # URL amigável: hermano-flavio-de-moura
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Profile Data
    cpf = Column(String, nullable=True)  # CPF do profissional (apenas números, 11 dígitos)
    cep = Column(String, nullable=True)
    street = Column(String, nullable=True)
    number = Column(String, nullable=True)
    complement = Column(String, nullable=True)
    neighborhood = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    whatsapp = Column(String, nullable=True)
    category = Column(String, nullable=True)
    description = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)  # URL ou caminho da foto de perfil

    # Avaliacao (denormalizados para performance em buscas)
    average_rating = Column(Float, nullable=True)
    total_reviews = Column(Integer, default=0)

    is_active = Column(Boolean, default=True)
    is_professional = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    is_suspended = Column(Boolean, default=False)
    subscription_status = Column(String, default="inactive") # inactive, active, cancelled, suspended

    # Plano de assinatura
    subscription_plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=True)
    trial_ends_at = Column(DateTime(timezone=True), nullable=True)
    subscription_started_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacionamentos
    subscription_plan = relationship("SubscriptionPlan", back_populates="users")
    services = relationship("Service", back_populates="professional")
    working_hours = relationship("WorkingHour", back_populates="professional")
    appointments_as_professional = relationship("Appointment", foreign_keys="[Appointment.professional_id]", back_populates="professional")
    appointments_as_client = relationship("Appointment", foreign_keys="[Appointment.client_id]", back_populates="client")
    subscription = relationship("Subscription", back_populates="professional", uselist=False)
    notifications = relationship("Notification", back_populates="user")
    reviews_received = relationship("Review", back_populates="professional")

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=True) # Optional base price
    professional_id = Column(Integer, ForeignKey("users.id"))
    image_url = Column(String, nullable=True)  # URL da imagem (local ou Cloudinary)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    duration_type = Column(String, nullable=False, server_default='hourly')  # 'hourly' ou 'daily'

    professional = relationship("User", back_populates="services")
    appointments = relationship("Appointment", back_populates="service")

class WorkingHour(Base):
    __tablename__ = "working_hours"

    id = Column(Integer, primary_key=True, index=True)
    professional_id = Column(Integer, ForeignKey("users.id"))
    day_of_week = Column(Integer, nullable=False) # 0=Monday, 6=Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    professional = relationship("User", back_populates="working_hours")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"))
    professional_id = Column(Integer, ForeignKey("users.id"))
    service_id = Column(Integer, ForeignKey("services.id"))

    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    status = Column(String, default="scheduled") # scheduled, completed, cancelled, suspended, blocked
    reason = Column(String, nullable=True)
    is_manual_block = Column(Boolean, default=False)  # True se for bloqueio manual do profissional
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    client = relationship("User", foreign_keys=[client_id], back_populates="appointments_as_client")
    professional = relationship("User", foreign_keys=[professional_id], back_populates="appointments_as_professional")
    service = relationship("Service", back_populates="appointments")
    notifications = relationship("Notification", back_populates="appointment")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    professional_id = Column(Integer, ForeignKey("users.id"), unique=True)

    # NOVO: Relacionamento com o plano escolhido
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=True)

    # Mercado Pago Integration
    mercadopago_subscription_id = Column(String, nullable=True, unique=True)  # ID da assinatura no MP
    mercadopago_preapproval_id = Column(String, nullable=True)  # ID do preapproval no MP
    mercadopago_payer_id = Column(String, nullable=True)  # ID do pagador no MP
    init_point = Column(String, nullable=True)  # URL de checkout do MP

    # Subscription details
    plan_amount = Column(Float, default=50.00) # R$ 50/month
    status = Column(String, default="pending") # pending, active, cancelled, suspended, paused, expired
    next_billing_date = Column(Date, nullable=True)
    last_payment_date = Column(Date, nullable=True)
    
    # NOVO: Data de expiração do trial (15 dias)
    trial_ends_at = Column(Date, nullable=True)

    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    cancellation_reason = Column(Text, nullable=True)  # Motivo do cancelamento
    cancellation_reason_code = Column(String(50), nullable=True)  # Código do motivo para analytics

    # Cancelamento agendado (usuário pode usar até vencimento)
    scheduled_cancellation_date = Column(Date, nullable=True)  # Data em que cancelamento será efetivado

    # Mudança de plano agendada (para downgrades)
    scheduled_plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=True)
    scheduled_plan_change_date = Column(Date, nullable=True)  # Data em que mudança será efetivada

    # Controle de falhas de pagamento
    payment_failure_count = Column(Integer, default=0)  # Contador de falhas consecutivas
    last_payment_failure_date = Column(Date, nullable=True)  # Data da última falha
    grace_period_ends_at = Column(Date, nullable=True)  # Fim do período de tolerância (7 dias)

    # Notificação de renovação enviada
    renewal_reminder_sent_at = Column(Date, nullable=True)  # Quando enviou aviso de 7 dias

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relacionamentos
    professional = relationship("User", back_populates="subscription")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions", foreign_keys=[plan_id])
    scheduled_plan = relationship("SubscriptionPlan", foreign_keys=[scheduled_plan_id])


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)

    # Tipo e canal
    type = Column(String(50), nullable=False)  # new_appointment, appointment_updated, appointment_cancelled
    channel = Column(String(20), nullable=False, default="email")  # email, sms, whatsapp, push

    # Status
    status = Column(String(20), default="pending")  # pending, sent, error

    # Conteúdo
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sent_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)

    # Relacionamentos
    user = relationship("User", back_populates="notifications")
    appointment = relationship("Appointment", back_populates="notifications")


class ReviewToken(Base):
    """Token UUID para avaliacao de servico - uso unico"""
    __tablename__ = "review_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(36), unique=True, nullable=False, index=True)
    appointment_id = Column(
        Integer, ForeignKey("appointments.id"),
        nullable=False, unique=True
    )
    created_at = Column(
        DateTime(timezone=True), server_default=func.now()
    )
    used_at = Column(DateTime(timezone=True), nullable=True)

    # Relacionamentos
    appointment = relationship("Appointment", backref="review_token")


class Review(Base):
    """Avaliacao de um servico prestado"""
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(
        Integer, ForeignKey("appointments.id"),
        nullable=False, unique=True
    )
    professional_id = Column(
        Integer, ForeignKey("users.id"),
        nullable=False, index=True
    )
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    customer_name = Column(String(255), nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relacionamentos
    appointment = relationship("Appointment", backref="review")
    professional = relationship(
        "User", back_populates="reviews_received"
    )
