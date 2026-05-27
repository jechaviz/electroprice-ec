import { AuthService } from "./AuthService";
import { DataService } from "./DataService";
import { CartService } from "./CartService";
import { UserService } from "./UserService";
import { NotificationService } from "./NotificationService";
import { PaymentService } from "./PaymentService";
import { AnalyticsService } from "./AnalyticsService";
import { LanguageService } from "./LanguageService";
import { CampaignService } from "./CampaignService";
import { PromotionService } from "./PromotionService";
import { LogisticsService } from "./LogisticsService";
import { LiveInventoryService } from "./LiveInventoryService";
import { SupportService } from "./SupportService";
import { BrandingService } from "./BrandingService";
import { ExportService } from "./ExportService";
import { DemoService } from "./DemoService";
import { ConfigService } from "./ConfigService";
import { ProviderRuntimeService } from "./ProviderRuntimeService";
import { SubshoppingService } from "./SubshoppingService";
import { OrderLifecycleService } from "./OrderLifecycleService";

export class ServiceContainer {
    // Domain Services
    auth = AuthService;
    data = DataService;
    cart = CartService;
    user = UserService;
    
    // Infrastructure Services
    notification = NotificationService;
    payment = PaymentService;
    language = LanguageService;
    analytics = new AnalyticsService();
    campaign = new CampaignService();
    promotion = new PromotionService();
    logistics = new LogisticsService();
    inventory = new LiveInventoryService();
    support = new SupportService();
    branding = new BrandingService();
    export = new ExportService();
    demo = new DemoService();
    config = new ConfigService();
    providerRuntime = new ProviderRuntimeService();
    subshopping = new SubshoppingService();
    orderLifecycle = new OrderLifecycleService();
}

export const services = new ServiceContainer();
