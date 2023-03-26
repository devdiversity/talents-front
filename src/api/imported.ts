//api version ???
//=================================================================================================
//=================================================================================================
//=================================================================================================

// GENERATED DON'T MODIFY

//=================================================================================================
/*
EXAMPLE OF GIN EXPORTED API
*/
//=================================================================================================

class ApiError extends Error {
  constructor(public data: ApiRestResponse) {
    super(data.message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  Message() {
    return this.message;
  }

  Data() {
    return this.data;
  }
}

class ApiInfoError extends Error {
  constructor(message: string, public _code: number) {
    super(message);
    Object.setPrototypeOf(this, ApiInfoError.prototype);
  }

  Message() {
    return this.message;
  }

  Code() {
    return this._code;
  }
}

class Api {
  StoreRequest: ((handler: string, data: ApiRestResponse | null, error: string | null, ok: boolean) => void) | null;
  ApiURL: string;
  ApiSystemError: ((result: ApiRestResponse, url: string, handler: string) => void) | null;
  ApiLogError: ((url: string, handler: string, error: ApiError) => void) | null;
  ApiError500: ((url: string, handler: string, error: Error) => void) | null;
  ApiWaitingRecconnect: ((handler: string, dbOk: boolean, ok: boolean, tentative: number) => void) | null;

  localStorage: Storage | null;

  constructor(apiurl: string) {
    this.StoreRequest = null;
    this.ApiURL = apiurl;
    this.ApiSystemError = null;
    this.ApiLogError = null;
    this.ApiError500 = null;
    this.ApiWaitingRecconnect = null;
    this.localStorage = null;
  }

  request(method: string, url: string, data: unknown, timeout = 7000, upload = false) {
    return new Promise((resolve, reject) => {
      let auth: string;
      const headers: { [key: string]: string } = {
        'Content-Type': upload ? 'multipart/form-data' : 'application/json',
        'Cache-Control': 'no-cache',
      };
      if (this.localStorage) {
        auth = localStorage.getItem('jwt-token') as string;
        headers['auth-token'] = auth;
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      let requestOptions: RequestInit = {
        method: method,
        body: data ? JSON.stringify(data) : undefined,
        cache: 'no-store',
        credentials: 'include',
        headers: headers || {},
        signal: controller.signal,
      };

      if (upload) {
        requestOptions = {
          method: method,
          body: data as FormData,
          signal: controller.signal,
        };
      }

      fetch(url, requestOptions)
        .then((response) => {
          if (!response.ok) {
            const error = `api.error.${response.statusText}`;
            throw error;
          } else {
            if (this.localStorage) {
              const jwt = response.headers.get('auth-token');
              if (jwt) {
                this.localStorage.setItem('jwt-token', jwt);
              }
            }
            return response.json() as Promise<ApiRestResponse>;
          }
        })
        .then((data) => {
          clearTimeout(timeoutId);
          if (data.hasOwnProperty('ok')) {
            const d: ApiRestResponse = data;
            if (!d.ok) {
              const err = new ApiError(data);
              throw err;
            } else {
              if (data.info && data.info['error']) {
                const code = parseInt(data.info['error']);
                reject(new ApiInfoError(ResponseErrors[code], code));
              } else {
                resolve(data);
              }
            }
          } else {
            throw 'api.error.wrongdatatype';
          }
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          if ((error as Error).toString() === 'DOMException: The user aborted a request.') {
            const d = <ApiRestResponse>Object.assign(
              {},
              {
                ok: false,
                code: 501,
                message: 'api.error.timeouterror',
              }
            );
            reject(new ApiError(d));
            return;
          }
          if ((error as Error).toString() === 'TypeError: Failed to fetch') {
            const d = <ApiRestResponse>Object.assign(
              {},
              {
                ok: false,
                code: 500,
                message: 'api.error.connectionerror',
              }
            );
            reject(new ApiError(d));
            return;
          }
          reject(error);
        });
    });
  }

  processResult(url: string, handler: string, result: ApiRestResponse): { data: unknown; error: ApiRestResponseError | null; info: Record<string, string> | null } {
    if (result.ok) {
      if (typeof this.StoreRequest == 'function') {
        this.StoreRequest(handler, result, null, true);
      }
      // maybe change this function
      // no data for result
      if (typeof result.data !== 'object') {
        return { data: result.data, error: null, info: null };
      } else if (!result.data) {
        result.data = {};
      }
      Object.defineProperty(result.data, '__api_handler__', {
        value: handler,
        writable: false,
      });
      return { data: result.data, error: null, info: result.info };
    } else {
      if (typeof this.ApiSystemError == 'function') {
        this.ApiSystemError(result, `GET:${this.ApiURL}${url}`, handler);
      }
      const err = ResponseErrors[result.code as ResponseCode];
      const errorData: ApiRestResponseError = {
        code: result.code,
        text: err,
      };
      Object.defineProperty(errorData, '__api_error__', {
        value: result.code,
        writable: false,
      });
      return { data: {}, error: errorData, info: null };
    }
  }

  processError(
    error: unknown,
    url: string,
    handler: string
  ): {
    data: unknown;
    error: ApiRestResponseError | null;
  } {
    if (error instanceof ApiError) {
      const errorData: ApiRestResponseError = {
        code: error.data.code,
        text: ResponseErrors[error.data.code],
      };
      Object.defineProperty(errorData, '__api_error__', {
        value: error.data.code,
        writable: false,
      });
      if (typeof this.ApiError500 === 'function' && error.data.code >= 500) {
        this.ApiError500(url, handler, error);
      }
      if (typeof this.ApiLogError == 'function') {
        this.ApiLogError(url, handler, error);
      }
      return { data: error.data, error: errorData };
    }
    if (error instanceof ApiInfoError) {
      if (typeof this.ApiError500 === 'function') {
        this.ApiError500(url, handler, error);
      }
      return {
        data: null,
        error: {
          code: error.Code(),
          text: error.Message(),
        },
      };
    }
    if (error instanceof DOMException) {
      if (typeof this.ApiError500 === 'function') {
        this.ApiError500(url, handler, error);
      }
      return {
        data: null,
        error: {
          code: 501,
          text: error.message,
        },
      };
    }
    if (typeof this.ApiError500 === 'function') {
      this.ApiError500(url, handler, error as Error);
    }
    return {
      data: null,
      error: {
        code: 500,
        text: 'api.error.unknown',
      },
    };
  }

  async waitReconnect(
    method: string,
    url: string,
    handler: string,
    timeout?: number,
    upload?: boolean
  ): Promise<{
    data: unknown;
    error: ApiRestResponseError | null;
  }> {
    return new Promise(async (resolve) => {
      let resolved = false;
      do {
        let result: {
          data: unknown;
          error: ApiRestResponseError | null;
        };
        try {
          await this.request('GET', `${this.ApiURL}/test`, null, timeout, upload);

          try {
            const r = (await this.request(method, `${this.ApiURL}${url}`, null, timeout, upload)) as ApiRestResponse;
            result = this.processResult(url, handler, r);
            if (typeof this.ApiWaitingRecconnect === 'function') {
              this.ApiWaitingRecconnect(handler, true, true, 0);
            }
            resolved = true;
            resolve(result);
          } catch (error) {
            resolved = false;
            if (typeof this.ApiWaitingRecconnect === 'function') {
              this.ApiWaitingRecconnect(handler, false, false, 1);
            }
          }
        } catch (error) {
          resolved = false;
          if (typeof this.ApiWaitingRecconnect === 'function') {
            this.ApiWaitingRecconnect(handler, false, false, 2);
          }
        }
      } while (!resolved);
    });
  }

  async GET(
    url: string,
    handler: string,
    timeout?: number
  ): Promise<{
    data: unknown;
    error: ApiRestResponseError | null;
  }> {
    try {
      const result = (await this.request('GET', `${this.ApiURL}${url}`, null, timeout)) as ApiRestResponse;
      return this.processResult(url, handler, result);
    } catch (error) {
      return new Promise<{
        data: unknown;
        error: ApiRestResponseError | null;
      }>(async (resolve) => {
        let result = this.processError(error, `GET => ${this.ApiURL}${url}`, handler);
        if (result.error?.code === 501) {
          result = await this.waitReconnect('GET', url, handler, timeout);
          resolve(result);
        } else {
          resolve(result);
        }
      });
    }
  }

  async POST(
    url: string,
    handler: string,
    data: unknown,
    timeout?: number
  ): Promise<{
    data: unknown;
    error: ApiRestResponseError | null;
  }> {
    try {
      let upload = false;
      if (url.includes('/upload/')) {
        upload = true;
      }
      const result = (await this.request('POST', `${this.ApiURL}${url}`, data, timeout, upload)) as ApiRestResponse;
      return this.processResult(url, handler, result);
    } catch (error) {
      return new Promise<{
        data: unknown;
        error: ApiRestResponseError | null;
      }>(async (resolve) => {
        let result = this.processError(error, `POST => ${this.ApiURL}${url}`, handler);
        if (result.error?.code === 501) {
          result = await this.waitReconnect('POST', url, handler, timeout);
          resolve(result);
        } else {
          resolve(result);
        }
      });
    }
  }

  async UPLOAD(
    url: string,
    handler: string,
    data: unknown,
    timeout?: number
  ): Promise<{
    data: unknown;
    error: ApiRestResponseError | null;
  }> {
    try {
      const result = (await this.request('POST', `${this.ApiURL}${url}`, data, timeout, true)) as ApiRestResponse;
      return this.processResult(url, handler, result);
    } catch (error) {
      return new Promise<{
        data: unknown;
        error: ApiRestResponseError | null;
      }>((resolve) => {
        resolve(this.processError(error, `POST => ${this.ApiURL}${url}`, handler));
      });
    }
  }
}
export const api = new Api('http://localhost:8088');

export const apiVersion = 'beta.0.0.0';

export const backend = 'http://localhost:8088';

export const avatars = '/assets/avatars/';

// github.com/devdiversity/gin-typescript/ginServer.TestData
export interface TestData {
  ok: boolean;
  dbOk: boolean;
}

// github.com/devdiversity/gin-typescript/modules/users.NicknameCheckForm
export interface NicknameCheckForm {
  userId: string;
  nickname: string;
}

// github.com/devdiversity/gin-typescript/templatesMjml.ResultTemplate
export interface ResultTemplate {
  lang: string;
  name: string;
  template: string;
  errors: MjmlError[] | null;
}

// github.com/devdiversity/gin-typescript/templatesMjml.TemplateMJML
export interface TemplateMJML {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  lang: string;
  mjml: string;
}

// github.com/devdiversity/gin-typescript/models.UserProfile
export interface UserProfile {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  title: string;
  nickname: string;
  firstname: string;
  lastname: string;
  address1: string;
  address2: string;
  city: string;
  zip: string;
  country: string;
  phoneNumber: string;
  mobileNumber: string;
}

// github.com/devdiversity/gin-typescript/modules/admin.UsersResponse
export interface UsersResponse {
  count: number;
  page: number;
  pagesize: number;
  users: User[];
}

// github.com/devdiversity/gin-typescript/act.FlatRolesResult
export interface FlatRolesResult {
  roles: { [key: string]: FlatRole | null };
  tree: AuthRole;
  default: string;
  superadmin: string;
  rolesadmin: string;
}

// github.com/devdiversity/gin-typescript/modules/users.ForgotPasswordForm
export interface ForgotPasswordForm {
  email: string;
  browser: string;
  operatingSystem: string;
}

// github.com/devdiversity/gin-typescript/modules/images.AddImageForm
export interface AddImageForm {
  uuid: string;
  category: string;
  description: string;
}

// github.com/devdiversity/gin-typescript/modules/users.UserContactsForm
export interface UserContactsForm {
  userUUID: string;
  title: string;
  nickname: string;
  firstname: string;
  lastname: string;
  address1: string;
  address2: string;
  city: string;
  zip: string;
  country: string;
  phoneNumber: string;
  mobileNumber: string;
}

// github.com/devdiversity/gin-typescript/modules/users.UserSocialsForm
export interface UserSocialsForm {
  uuid: string;
  socials: string;
}

// github.com/devdiversity/gin-typescript/modules/avatar.AvatarResponse
export interface AvatarResponse {
  UUID: string;
  image: string;
}

// github.com/devdiversity/gin-typescript/models.Social
export interface Social {
  icon: string;
  label: string;
  addressMask: string;
  address: string;
}

// github.com/devdiversity/gin-typescript/modules/users.UserPreferencesForm
export interface UserPreferencesForm {
  uuid: string;
  preferences: Preferences;
}

// github.com/devdiversity/gin-typescript/restService.ApiRestResponseError
export interface ApiRestResponseError {
  code: number;
  text: string;
}

// github.com/devdiversity/gin-typescript/restService.ApiRestResponse
export interface ApiRestResponse {
  ok: boolean;
  code: number;
  data?: unknown;
  datatype?: string;
  message?: string;
  error?: string;
  info: { [key: string]: string };
}

// github.com/devdiversity/gin-typescript/modules/images.ImageResponse
export interface ImageResponse {
  UUID: string;
  image: string;
}

// github.com/devdiversity/gin-typescript/modules/admin.UserCreateForm
export interface UserCreateForm {
  email: string;
  password: string;
}

// github.com/devdiversity/gin-typescript/templatesMjml.MjmlTemplate
export interface MjmlTemplate {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  name: string;
  type: string;
  mjml: TemplateMJML[];
  html: TemplateHTML[];
  variables: { [key: string]: unknown };
}

// github.com/devdiversity/gin-typescript/modules/images.Image
export interface Image {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  uuid: string;
  category: string;
  description: string;
}

// github.com/devdiversity/gin-typescript/models.UserShort
export interface UserShort {
  uuid: string;
  email: string;
  roles: string[];
  status: UserStatus;
  avatar?: boolean;
  created?: Date;
  profile: UserProfile;
  preferences: Preferences;
  socials: string;
}

// github.com/devdiversity/gin-typescript/modules/avatar.AvatarForm
export interface AvatarForm {
  UUID: string;
  avatar: string;
}

// github.com/devdiversity/gin-typescript/core.TemplatesConstants
export interface TemplatesConstants {
  ProductName: string;
  CompanyName: string;
  CompanyAddress1: string;
  CompanyAddress2: string;
  CompanyAddress3: string;
  Copyright: string;
  SiteName: string;
  SiteUrl: string;
  SiteSupport: string;
  SiteMail: string;
  SiteMailfrom: string;
  HelpUrl: string;
  LiveChatUrl: string;
  SupportEmail: string;
  SupportUrl: string;
  SenderNames: string;
}

// github.com/devdiversity/gin-typescript/templatesMjml.MjmlError
export interface MjmlError {
  line: number;
  tagName: string;
  startLine: number;
  endLine: number;
  startPos: number;
  endPos: number;
  message: string;
}

// github.com/devdiversity/gin-typescript/act.FlatRole
export interface FlatRole {
  id: number;
  name: string;
  path: string;
  user: number;
  route: number;
  level: number;
  icon: string | null;
  description: string | null;
}

// github.com/devdiversity/gin-typescript/act.AuthRole
export interface AuthRole {
  name: string;
  description: string | null;
  selected: boolean;
  icon: string | null;
  roles: AuthRole[];
}

// github.com/devdiversity/gin-typescript/modules/admin.StatusForm
export interface StatusForm {
  userUUID: string;
  status: UserStatus;
}

// github.com/devdiversity/gin-typescript/modules/users.UserRegisterResponse
export interface UserRegisterResponse {
  token: string;
  user: User;
}

// github.com/devdiversity/gin-typescript/modules/system.Language
export interface Language {
  lang: string;
  label: string;
}

// github.com/devdiversity/gin-typescript/modules/admin.UsersForm
export interface UsersForm {
  page: number;
  pagesize: number;
}

// github.com/devdiversity/gin-typescript/templatesMjml.TansactionalThumbs
export interface TansactionalThumbs {
  thumbs: string[];
}

// github.com/devdiversity/gin-typescript/modules/users.LoginForm
export interface LoginForm {
  email: string;
  password: string;
}

// github.com/devdiversity/gin-typescript/modules/admin.ChangePasswordForm
export interface ChangePasswordForm {
  userUUID: string;
  password: string;
}

// github.com/devdiversity/gin-typescript/templatesMjml.TempatePreviewForm
export interface TempatePreviewForm {
  type: string;
  template: string;
}

// github.com/devdiversity/gin-typescript/templatesMjml.TempateSaveImageForm
export interface TempateSaveImageForm {
  image: string;
}

// github.com/devdiversity/gin-typescript/modules/users.ValidationTokenResponse
export interface ValidationTokenResponse {
  token: string;
}

// github.com/devdiversity/gin-typescript/templatesMjml.TempateForm
export interface TempateForm {
  lang: string;
  name: string;
}

// github.com/devdiversity/gin-typescript/templatesMjml.TemplateHTML
export interface TemplateHTML {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  lang: string;
  html: string;
}

// github.com/devdiversity/gin-typescript/modules/users.RegisterForm
export interface RegisterForm {
  email: string;
  password: string;
}

// github.com/devdiversity/gin-typescript/modules/images.ImageResponseInfo
export interface ImageResponseInfo {
  UUID: string;
  image: Image;
}

// github.com/devdiversity/gin-typescript/models.User
export interface User {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  uuid: string;
  email: string;
  roles: string[];
  status: UserStatus;
  preferences: Preferences;
  socials: string;
  profile: UserProfile;
}

// github.com/devdiversity/gin-typescript/modules/admin.RolesForm
export interface RolesForm {
  userUUID: string;
  roles: string[];
}

// github.com/devdiversity/gin-typescript/templatesMjml.SaveTempateForm
export interface SaveTempateForm {
  name: string;
  lang: string;
  mjml: string;
  type: string;
}

// github.com/devdiversity/gin-typescript/modules/system.SystemInfo
export interface SystemInfo {
  version: string;
  roles: FlatRolesResult;
  avatars: string;
  languages: Language[];
}

// github.com/devdiversity/gin-typescript/templatesMjml.TemplatesResponse
export interface TemplatesResponse {
  constants: TemplatesConstants;
  templates: MjmlTemplate[];
}

// github.com/devdiversity/gin-typescript/models.Preferences
export interface Preferences {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  useIdle: boolean;
  idleTimeout: number;
  useIdlePassword: boolean;
  idlePin: string;
  useDirectLogin: boolean;
  useQuadcodeLogin: boolean;
  sendNoticesMail: boolean;
  language: string;
}

// github.com/devdiversity/gin-typescript/modules/images.RemoveImageForm
export interface RemoveImageForm {
  imageUUID: string;
}

// github.com/devdiversity/gin-typescript/modules/users.NewPasswordForm
export interface NewPasswordForm {
  token: string;
  password: string;
}

// github.com/devdiversity/gin-typescript/modules/images.UploadImageForm
export interface UploadImageForm {
  file: string;
}

// github.com/devdiversity/gin-typescript/core.CommonModel
export interface CommonModel {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// github.com/devdiversity/gin-typescript/models.UserStatus
export enum UserStatus {
  Banned = 'Banned',
  Operating = 'Operating',
  Suspended = 'Suspended',
  WaitingAdv = 'WaitingAdv',
}

// github
export const ResponseErrors = JSON.parse(`{
    "300": "api.error.unknow",
    "301": "api.error.forbidden",
    "302": "api.error.wrongform",
    "303": "api.error.wrongcredentials",
    "304": "api.error.wrongparameters",
    "305": "api.error.wrongemail",
    "306": "api.error.usernotfound",
    "307": "api.error.useralreadyexist",
    "308": "api.error.notauthorized",
    "309": "api.error.notlogged",
    "310": "api.error.dberror",
    "311": "api.error.rolesupdate",
    "312": "api.error.roleread",
    "313": "api.error.changepassword",
    "314": "api.error.usercreatefail",
    "315": "api.error.tokenfail",
    "316": "api.error.tokenverifyfail",
    "317": "api.error.tokenverifyexpired",
    "318": "api.error.tokenverifyuserfail",
    "319": "api.error.templatemailnotfound",
    "320": "api.error.savetemplatemailfail",
    "321": "api.error.inlinetemplatemailfail",
    "322": "api.error.inlinetemplatemailtestfail",
    "323": "api.error.invalidemailaddress",
    "324": "api.error.sendmailfails",
    "325": "api.error.parsetemplatefail",
    "326": "api.error.executetemplatefail",
    "327": "api.error.imgwrongformat",
    "328": "api.error.imgwwrite",
    "329": "api.error.imgsave",
    "330": "api.error.imgnotfound",
    "331": "api.error.statusupdatefail",
    "332": "api.error.passwordresetfail",
    "333": "api.error.updateprofielfail",
    "334": "api.error.updaterecordfail",
    "335": "api.error.nicknamebusy"
  }`) as { [key: ResponseCode]: string };

// github
export const ResponseSuccess = JSON.parse(`{
    "200": "api.ok",
    "201": "api.ok.created",
    "202": "api.ok.updated",
    "203": "api.ok.loginok",
    "204": "api.ok.logoutok",
    "205": "api.ok.tokenok",
    "206": "api.ok.tokenverifyok",
    "207": "api.ok.passwordresetok",
    "208": "api.ok.imageprocessedsucessfully"
  }`) as { [key: ResponseCode]: string };

// github
export type Socials = { [key: string]: Social };

// github
export type ResponseCode = number;

export class Users {
  // GET:/users/validate/:email
  static async ValidateEmail(email: string): Promise<{ data: boolean; error: ApiRestResponseError | null }> {
    return (await api.GET(`/users/validate/${email}`, 'ValidateEmail')) as { data: boolean; error: ApiRestResponseError | null };
  }

  // POST:/users/updatepreferences
  static async UpdatePreferences(data: UserPreferencesForm): Promise<{ data: UserShort; error: ApiRestResponseError | null }> {
    return (await api.POST('/users/updatepreferences', 'UpdatePreferences', data)) as { data: UserShort; error: ApiRestResponseError | null };
  }

  // POST:/users/login
  static async LoginToAccount(data: LoginForm): Promise<{ data: UserShort; error: ApiRestResponseError | null }> {
    return (await api.POST('/users/login', 'LoginToAccount', data)) as { data: UserShort; error: ApiRestResponseError | null };
  }

  // GET:/users/registrationVerification/:token
  static async RegistrationVerification(token: string): Promise<{ data: UserShort; error: ApiRestResponseError | null }> {
    return (await api.GET(`/users/registrationVerification/${token}`, 'RegistrationVerification')) as { data: UserShort; error: ApiRestResponseError | null };
  }

  // POST:/users/updateprofile
  static async UpdateContacts(data: UserContactsForm): Promise<{ data: UserShort; error: ApiRestResponseError | null }> {
    return (await api.POST('/users/updateprofile', 'UpdateContacts', data)) as { data: UserShort; error: ApiRestResponseError | null };
  }

  // GET:/users/forgotVerification/:token
  static async TokenVerification(token: string): Promise<{ data: UserShort; error: ApiRestResponseError | null }> {
    return (await api.GET(`/users/forgotVerification/${token}`, 'TokenVerification')) as { data: UserShort; error: ApiRestResponseError | null };
  }

  // POST:/users/logout
  static async LogoutFromAccount(): Promise<{ data: null; error: ApiRestResponseError | null }> {
    return (await api.POST('/users/logout', 'LogoutFromAccount', null)) as { data: null; error: ApiRestResponseError | null };
  }

  // POST:/users/me
  static async WhoIm(): Promise<{ data: UserShort; error: ApiRestResponseError | null }> {
    return (await api.POST('/users/me', 'WhoIm', null)) as { data: UserShort; error: ApiRestResponseError | null };
  }

  // POST:/users/checknickname
  static async NicknameExist(data: NicknameCheckForm): Promise<{ data: null; error: ApiRestResponseError | null }> {
    return (await api.POST('/users/checknickname', 'NicknameExist', data)) as { data: null; error: ApiRestResponseError | null };
  }

  // GET:/users/heartbeat
  static async Heartbeat(): Promise<{ data: boolean; error: ApiRestResponseError | null }> {
    return (await api.GET('/users/heartbeat', 'Heartbeat')) as { data: boolean; error: ApiRestResponseError | null };
  }

  // POST:/users/updatesocials
  static async UpdateSocials(data: UserSocialsForm): Promise<{ data: UserShort; error: ApiRestResponseError | null }> {
    return (await api.POST('/users/updatesocials', 'UpdateSocials', data)) as { data: UserShort; error: ApiRestResponseError | null };
  }

  // POST:/users/signup
  static async Register(data: RegisterForm): Promise<{ data: UserRegisterResponse; error: ApiRestResponseError | null }> {
    return (await api.POST('/users/signup', 'Register', data)) as { data: UserRegisterResponse; error: ApiRestResponseError | null };
  }

  // POST:/users/forgotpassword
  static async ForgotAccountPassword(data: ForgotPasswordForm): Promise<{ data: ValidationTokenResponse; error: ApiRestResponseError | null }> {
    return (await api.POST('/users/forgotpassword', 'ForgotAccountPassword', data)) as { data: ValidationTokenResponse; error: ApiRestResponseError | null };
  }

  // POST:/users/newpassword
  static async ChangeUserPassword(data: NewPasswordForm): Promise<{ data: UserShort; error: ApiRestResponseError | null }> {
    return (await api.POST('/users/newpassword', 'ChangeUserPassword', data)) as { data: UserShort; error: ApiRestResponseError | null };
  }
}
export class Avatar {
  // GET:/users/avatar/:avatar
  static async GetAvatar(avatar: string): Promise<{ data: AvatarResponse; error: ApiRestResponseError | null }> {
    return (await api.GET(`/users/avatar/${avatar}`, 'GetAvatar')) as { data: AvatarResponse; error: ApiRestResponseError | null };
  }

  // POST:/users/updateavatar
  static async SaveAvatar(data: AvatarForm): Promise<{ data: null; error: ApiRestResponseError | null }> {
    return (await api.POST('/users/updateavatar', 'SaveAvatar', data)) as { data: null; error: ApiRestResponseError | null };
  }

  // POST:/admin/deleteavatar
  static async DeleteUserAvatar(data: AvatarForm): Promise<{ data: null; error: ApiRestResponseError | null }> {
    return (await api.POST('/admin/deleteavatar', 'DeleteUserAvatar', data)) as { data: null; error: ApiRestResponseError | null };
  }
}
export class System {
  // GET:/system/
  static async System(): Promise<{ data: SystemInfo; error: ApiRestResponseError | null }> {
    return (await api.GET('/system/', 'System')) as { data: SystemInfo; error: ApiRestResponseError | null };
  }

  // GET:/system/roles
  static async GetRoles(): Promise<{ data: FlatRolesResult; error: ApiRestResponseError | null }> {
    return (await api.GET('/system/roles', 'GetRoles')) as { data: FlatRolesResult; error: ApiRestResponseError | null };
  }
}
export class TemplatesMjml {
  // POST:/templates/template
  static async GetTransctionalMail(data: TempateForm): Promise<{ data: ResultTemplate; error: ApiRestResponseError | null }> {
    return (await api.POST('/templates/template', 'GetTransctionalMail', data)) as { data: ResultTemplate; error: ApiRestResponseError | null };
  }

  // POST:/templates/render
  static async RenderMjml(data: TempatePreviewForm): Promise<{ data: ResultTemplate; error: ApiRestResponseError | null }> {
    return (await api.POST('/templates/render', 'RenderMjml', data)) as { data: ResultTemplate; error: ApiRestResponseError | null };
  }

  // POST:/templates/addimage
  static async SaveTransctionalImage(data: TempateSaveImageForm): Promise<{ data: TansactionalThumbs; error: ApiRestResponseError | null }> {
    return (await api.POST('/templates/addimage', 'SaveTransctionalImage', data)) as { data: TansactionalThumbs; error: ApiRestResponseError | null };
  }

  // POST:/templates/savetemplate
  static async SaveTransctionalMail(data: SaveTempateForm): Promise<{ data: ResultTemplate; error: ApiRestResponseError | null }> {
    return (await api.POST('/templates/savetemplate', 'SaveTransctionalMail', data)) as { data: ResultTemplate; error: ApiRestResponseError | null };
  }

  // GET:/templates/all
  static async AllTemplates(): Promise<{ data: TemplatesResponse; error: ApiRestResponseError | null }> {
    return (await api.GET('/templates/all', 'AllTemplates')) as { data: TemplatesResponse; error: ApiRestResponseError | null };
  }

  // GET:/templates/thumbs
  static async GetThumbs(): Promise<{ data: TansactionalThumbs; error: ApiRestResponseError | null }> {
    return (await api.GET('/templates/thumbs', 'GetThumbs')) as { data: TansactionalThumbs; error: ApiRestResponseError | null };
  }
}
export class GinServer {
  // GET:/test
  static async handlerTest(): Promise<{ data: TestData; error: ApiRestResponseError | null }> {
    return (await api.GET('/test', 'handlerTest')) as { data: TestData; error: ApiRestResponseError | null };
  }
}
export class Images {
  // GET:/images/image/:uuid
  static async FindImage(uuid: string): Promise<{ data: ImageResponseInfo; error: ApiRestResponseError | null }> {
    return (await api.GET(`/images/image/${uuid}`, 'FindImage')) as { data: ImageResponseInfo; error: ApiRestResponseError | null };
  }

  // GET:/images/getimage/:uuid
  static async GetImage(uuid: string): Promise<{ data: ImageResponse; error: ApiRestResponseError | null }> {
    return (await api.GET(`/images/getimage/${uuid}`, 'GetImage')) as { data: ImageResponse; error: ApiRestResponseError | null };
  }

  // POST:/images/updateimage
  static async UpdateImageDetails(data: AddImageForm): Promise<{ data: string; error: ApiRestResponseError | null }> {
    return (await api.POST('/images/updateimage', 'UpdateImageDetails', data)) as { data: string; error: ApiRestResponseError | null };
  }

  // POST:/images/upload/image
  static async UploadImage(data: UploadImageForm): Promise<{ data: null; error: ApiRestResponseError | null }> {
    return (await api.POST('/images/upload/image', 'UploadImage', data)) as { data: null; error: ApiRestResponseError | null };
  }

  // POST:/images/addimage
  static async AddImage(data: AddImageForm): Promise<{ data: string; error: ApiRestResponseError | null }> {
    return (await api.POST('/images/addimage', 'AddImage', data)) as { data: string; error: ApiRestResponseError | null };
  }

  // POST:/images/removeimage
  static async RemoveImage(data: RemoveImageForm): Promise<{ data: null; error: ApiRestResponseError | null }> {
    return (await api.POST('/images/removeimage', 'RemoveImage', data)) as { data: null; error: ApiRestResponseError | null };
  }
}
export class Admin {
  // POST:/admin/create
  static async CreateUser(data: UserCreateForm): Promise<{ data: UserShort; error: ApiRestResponseError | null }> {
    return (await api.POST('/admin/create', 'CreateUser', data)) as { data: UserShort; error: ApiRestResponseError | null };
  }

  // POST:/admin/changepassword
  static async ChangeUserPassword(data: ChangePasswordForm): Promise<{ data: UserShort; error: ApiRestResponseError | null }> {
    return (await api.POST('/admin/changepassword', 'ChangeUserPassword', data)) as { data: UserShort; error: ApiRestResponseError | null };
  }

  // POST:/admin/
  static async FindAllUsers(data: UsersForm): Promise<{ data: UsersResponse; error: ApiRestResponseError | null }> {
    return (await api.POST('/admin/', 'FindAllUsers', data)) as { data: UsersResponse; error: ApiRestResponseError | null };
  }

  // POST:/admin/updatestatus
  static async UpdateUserStatus(data: StatusForm): Promise<{ data: UserShort; error: ApiRestResponseError | null }> {
    return (await api.POST('/admin/updatestatus', 'UpdateUserStatus', data)) as { data: UserShort; error: ApiRestResponseError | null };
  }

  // POST:/admin/updatesocials
  static async UpdateUserSocials(data: UserSocialsForm): Promise<{ data: UserShort; error: ApiRestResponseError | null }> {
    return (await api.POST('/admin/updatesocials', 'UpdateUserSocials', data)) as { data: UserShort; error: ApiRestResponseError | null };
  }

  // POST:/admin/updateroless
  static async UpdateUserRoles(data: RolesForm): Promise<{ data: UserShort; error: ApiRestResponseError | null }> {
    return (await api.POST('/admin/updateroless', 'UpdateUserRoles', data)) as { data: UserShort; error: ApiRestResponseError | null };
  }

  // POST:/admin/updatecontacts
  static async UpdateUserContacts(data: UserContactsForm): Promise<{ data: UserShort; error: ApiRestResponseError | null }> {
    return (await api.POST('/admin/updatecontacts', 'UpdateUserContacts', data)) as { data: UserShort; error: ApiRestResponseError | null };
  }

  // POST:/admin/updatepreferences
  static async UpdateUserPreferences(data: UserPreferencesForm): Promise<{ data: UserShort; error: ApiRestResponseError | null }> {
    return (await api.POST('/admin/updatepreferences', 'UpdateUserPreferences', data)) as { data: UserShort; error: ApiRestResponseError | null };
  }
}
