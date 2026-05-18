import { AuthService } from "./AuthService";
import { DataService } from "./DataService";
import { CartService } from "./CartService";
import { UserService } from "./UserService";
import { NotificationService } from "./NotificationService";
import { FilterService } from "./FilterService";
import { PaymentService } from "./PaymentService";
import { AnalyticsService } from "./AnalyticsService";
import { SecurityService } from "./SecurityService";
import { LanguageService } from "./LanguageService";
import { CurrencyService } from "./CurrencyService";
import { CampaignService } from "./CampaignService";
import { PromotionService } from "./PromotionService";
import { LogisticsService } from "./LogisticsService";
import { LiveInventoryService } from "./LiveInventoryService";
import { SupportService } from "./SupportService";
import { MonitoringService } from "./MonitoringService";
import { BrandingService } from "./BrandingService";
import { ExportService } from "./ExportService";
import { DemoService } from "./DemoService";
import { ConfigService } from "./ConfigService";
import { ProviderRuntimeService } from "./ProviderRuntimeService";
import { SubshoppingService } from "./SubshoppingService";

export class ServiceContainer {
    // Domain Services
    auth = AuthService;
    data = DataService;
    cart = CartService;
    user = UserService;
    filter = FilterService;
    
    // Infrastructure Services
    notification = NotificationService;
    payment = PaymentService;
    security = SecurityService;
    language = LanguageService;
    currency = CurrencyService;
    analytics = new AnalyticsService();
    campaign = new CampaignService();
    promotion = new PromotionService();
    logistics = new LogisticsService();
    inventory = new LiveInventoryService();
    support = new SupportService();
    monitoring = new MonitoringService();
    branding = new BrandingService();
    export = new ExportService();
    demo = new DemoService();
    config = new ConfigService();
    providerRuntime = new ProviderRuntimeService();
    subshopping = new SubshoppingService();
}

export const services = new ServiceContainer();
