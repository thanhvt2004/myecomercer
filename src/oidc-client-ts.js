// src/utils/CryptoUtils.ts
import sha256 from "crypto-js/sha256.js";
import Base64 from "crypto-js/enc-base64.js";
import Utf8 from "crypto-js/enc-utf8.js";

// src/utils/Log.ts
var nopLogger = {
  debug: () => void 0,
  info: () => void 0,
  warn: () => void 0,
  error: () => void 0
};
var NONE = 0;
var ERROR = 1;
var WARN = 2;
var INFO = 3;
var DEBUG = 4;
var Log = class {
  static get NONE() {
    return NONE;
  }
  static get ERROR() {
    return ERROR;
  }
  static get WARN() {
    return WARN;
  }
  static get INFO() {
    return INFO;
  }
  static get DEBUG() {
    return DEBUG;
  }
  static reset() {
    this._level = INFO;
    this._logger = nopLogger;
  }
  static get level() {
    return this._level;
  }
  static set level(value) {
    if (NONE > value || value > DEBUG) {
      throw new Error("Invalid log level");
    }
    this._level = value;
  }
  static get logger() {
    return this._logger;
  }
  static set logger(value) {
    this._logger = value;
  }
};
var Logger = class {
  constructor(name) {
    this._name = name;
  }
  debug(...args) {
    Logger.debug(this._name, ...args);
  }
  info(...args) {
    Logger.info(this._name, ...args);
  }
  warn(...args) {
    Logger.warn(this._name, ...args);
  }
  error(...args) {
    Logger.error(this._name, ...args);
  }
  static debug(name, ...args) {
    if (Log.level >= DEBUG) {
      Log.logger.debug(`[${name}]`, ...args);
    }
  }
  static info(name, ...args) {
    if (Log.level >= INFO) {
      Log.logger.info(`[${name}]`, ...args);
    }
  }
  static warn(name, ...args) {
    if (Log.level >= WARN) {
      Log.logger.warn(`[${name}]`, ...args);
    }
  }
  static error(name, ...args) {
    if (Log.level >= ERROR) {
      Log.logger.error(`[${name}]`, ...args);
    }
  }
};
Log.reset();

// src/utils/CryptoUtils.ts
var UUID_V4_TEMPLATE = "10000000-1000-4000-8000-100000000000";
var CryptoUtils = class {
  static _cryptoUUIDv4() {
    return UUID_V4_TEMPLATE.replace(/[018]/g, (c) => (+c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16));
  }
  static _UUIDv4() {
    return UUID_V4_TEMPLATE.replace(/[018]/g, (c) => (+c ^ Math.random() * 16 >> +c / 4).toString(16));
  }
  static generateUUIDv4() {
    const hasRandomValues = window.crypto && Object.prototype.hasOwnProperty.call(window.crypto, "getRandomValues");
    const uuid = hasRandomValues ? CryptoUtils._cryptoUUIDv4() : CryptoUtils._UUIDv4();
    return uuid.replace(/-/g, "");
  }
  static generateCodeVerifier() {
    return CryptoUtils.generateUUIDv4() + CryptoUtils.generateUUIDv4() + CryptoUtils.generateUUIDv4();
  }
  static generateCodeChallenge(code_verifier) {
    try {
      const hashed = sha256(code_verifier);
      return Base64.stringify(hashed).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (err) {
      Logger.error("CryptoUtils", err instanceof Error ? err.message : err);
      throw err;
    }
  }
  static generateBasicAuth(client_id, client_secret) {
    const basicAuth = Utf8.parse([client_id, client_secret].join(":"));
    return Base64.stringify(basicAuth);
  }
};

// src/utils/Event.ts
var Event = class {
  constructor(name) {
    this._callbacks = [];
    this._name = name;
    this._logger = new Logger(`Event(${name})`);
  }
  addHandler(cb) {
    this._callbacks.push(cb);
    return () => this.removeHandler(cb);
  }
  removeHandler(cb) {
    const idx = this._callbacks.lastIndexOf(cb);
    if (idx >= 0) {
      this._callbacks.splice(idx, 1);
    }
  }
  raise(...ev) {
    this._logger.debug("Raising event: " + this._name);
    for (const cb of this._callbacks) {
      void cb(...ev);
    }
  }
};

// src/utils/JwtUtils.ts
import jwt_decode from "jwt-decode";
var JwtUtils = class {
  static decode(token) {
    try {
      const payload = jwt_decode(token);
      return payload;
    } catch (err) {
      Logger.error("JwtUtils", err);
      throw err;
    }
  }
};

// src/utils/PopupUtils.ts
var PopupUtils = class {
  static center({ ...features }) {
    var _a, _b, _c;
    if (features.width == null)
      features.width = (_a = [800, 720, 600, 480].find((width) => width <= window.outerWidth / 1.618)) != null ? _a : 360;
    (_b = features.left) != null ? _b : features.left = Math.max(0, Math.round(window.screenX + (window.outerWidth - features.width) / 2));
    if (features.height != null)
      (_c = features.top) != null ? _c : features.top = Math.max(0, Math.round(window.screenY + (window.outerHeight - features.height) / 2));
    return features;
  }
  static serialize(features) {
    return Object.entries(features).filter(([, value]) => value != null).map(([key, value]) => `${key}=${typeof value !== "boolean" ? value : value ? "yes" : "no"}`).join(",");
  }
};

// src/utils/Timer.ts
var DefaultTimerDurationInSeconds = 5;
var g_timer = {
  setInterval: function(cb, duration) {
    return window.setInterval(cb, duration);
  },
  clearInterval: function(handle) {
    return window.clearInterval(handle);
  }
};
var Timer = class extends Event {
  constructor() {
    super(...arguments);
    this._timer = g_timer;
    this._timerHandle = null;
    this._expiration = 0;
    this._callback = () => {
      const diff = this._expiration - Timer.getEpochTime();
      this._logger.debug("_callback: " + this._name + " timer expires in:", diff);
      if (this._expiration <= Timer.getEpochTime()) {
        this.cancel();
        super.raise();
      }
    };
  }
  static getEpochTime() {
    return Math.floor(Date.now() / 1e3);
  }
  init(durationInSeconds) {
    if (durationInSeconds <= 0) {
      durationInSeconds = 1;
    }
    durationInSeconds = Math.floor(durationInSeconds);
    const expiration = Timer.getEpochTime() + durationInSeconds;
    if (this.expiration === expiration && this._timerHandle) {
      this._logger.debug("init timer " + this._name + " skipping initialization since already initialized for expiration:", this.expiration);
      return;
    }
    this.cancel();
    this._logger.debug("init timer " + this._name + " for duration:", durationInSeconds);
    this._expiration = expiration;
    let timerDurationInSeconds = DefaultTimerDurationInSeconds;
    if (durationInSeconds < timerDurationInSeconds) {
      timerDurationInSeconds = durationInSeconds;
    }
    this._timerHandle = this._timer.setInterval(this._callback, timerDurationInSeconds * 1e3);
  }
  get expiration() {
    return this._expiration;
  }
  cancel() {
    if (this._timerHandle) {
      this._logger.debug("cancel: ", this._name);
      this._timer.clearInterval(this._timerHandle);
      this._timerHandle = null;
    }
  }
};

// src/utils/UrlUtils.ts
var UrlUtils = class {
  static readParams(url, responseMode = "query") {
    const parsedUrl = new URL(url);
    const params = parsedUrl[responseMode === "fragment" ? "hash" : "search"];
    return new URLSearchParams(params.slice(1));
  }
};

// src/AccessTokenEvents.ts
var AccessTokenEvents = class {
  constructor({ expiringNotificationTimeInSeconds }) {
    this._logger = new Logger("AccessTokenEvents");
    this._expiringNotificationTimeInSeconds = expiringNotificationTimeInSeconds;
    this._expiringTimer = new Timer("Access token expiring");
    this._expiredTimer = new Timer("Access token expired");
  }
  load(container) {
    if (container.access_token && container.expires_in !== void 0) {
      const duration = container.expires_in;
      this._logger.debug("load: access token present, remaining duration:", duration);
      if (duration > 0) {
        let expiring = duration - this._expiringNotificationTimeInSeconds;
        if (expiring <= 0) {
          expiring = 1;
        }
        this._logger.debug("load: registering expiring timer in:", expiring);
        this._expiringTimer.init(expiring);
      } else {
        this._logger.debug("load: canceling existing expiring timer because we're past expiration.");
        this._expiringTimer.cancel();
      }
      const expired = duration + 1;
      this._logger.debug("load: registering expired timer in:", expired);
      this._expiredTimer.init(expired);
    } else {
      this._expiringTimer.cancel();
      this._expiredTimer.cancel();
    }
  }
  unload() {
    this._logger.debug("unload: canceling existing access token timers");
    this._expiringTimer.cancel();
    this._expiredTimer.cancel();
  }
  addAccessTokenExpiring(cb) {
    this._expiringTimer.addHandler(cb);
  }
  removeAccessTokenExpiring(cb) {
    this._expiringTimer.removeHandler(cb);
  }
  addAccessTokenExpired(cb) {
    this._expiredTimer.addHandler(cb);
  }
  removeAccessTokenExpired(cb) {
    this._expiredTimer.removeHandler(cb);
  }
};

// src/CheckSessionIFrame.ts
var CheckSessionIFrame = class {
  constructor(_callback, _client_id, url, _intervalInSeconds, _stopOnError) {
    this._callback = _callback;
    this._client_id = _client_id;
    this._intervalInSeconds = _intervalInSeconds;
    this._stopOnError = _stopOnError;
    this._timer = null;
    this._session_state = null;
    this._message = (e) => {
      if (e.origin === this._frame_origin && e.source === this._frame.contentWindow) {
        if (e.data === "error") {
          this._logger.error("error message from check session op iframe");
          if (this._stopOnError) {
            this.stop();
          }
        } else if (e.data === "changed") {
          this._logger.debug("changed message from check session op iframe");
          this.stop();
          void this._callback();
        } else {
          this._logger.debug(e.data + " message from check session op iframe");
        }
      }
    };
    this._logger = new Logger("CheckSessionIFrame");
    const idx = url.indexOf("/", url.indexOf("//") + 2);
    this._frame_origin = url.substr(0, idx);
    this._frame = window.document.createElement("iframe");
    this._frame.style.visibility = "hidden";
    this._frame.style.position = "fixed";
    this._frame.style.left = "-1000px";
    this._frame.style.top = "0";
    this._frame.width = "0";
    this._frame.height = "0";
    this._frame.src = url;
  }
  load() {
    return new Promise((resolve) => {
      this._frame.onload = () => {
        resolve();
      };
      window.document.body.appendChild(this._frame);
      window.addEventListener("message", this._message, false);
    });
  }
  start(session_state) {
    if (this._session_state === session_state) {
      return;
    }
    this._logger.debug("start");
    this.stop();
    this._session_state = session_state;
    const send = () => {
      if (!this._frame.contentWindow || !this._session_state) {
        return;
      }
      this._frame.contentWindow.postMessage(this._client_id + " " + this._session_state, this._frame_origin);
    };
    send();
    this._timer = window.setInterval(send, this._intervalInSeconds * 1e3);
  }
  stop() {
    this._session_state = null;
    if (this._timer) {
      this._logger.debug("stop");
      window.clearInterval(this._timer);
      this._timer = null;
    }
  }
};

// src/ErrorResponse.ts
var ErrorResponse = class extends Error {
  constructor(args) {
    super(args.error_description || args.error);
    if (!args.error) {
      Logger.error("ErrorResponse", "No error passed");
      throw new Error("No error passed");
    }
    this.name = "ErrorResponse";
    this.error = args.error;
    this.error_description = args.error_description;
    this.error_uri = args.error_uri;
    this.state = args.state;
    this.session_state = args.session_state;
  }
};

// src/InMemoryWebStorage.ts
var InMemoryWebStorage = class {
  constructor() {
    this._logger = new Logger("InMemoryWebStorage");
    this._data = {};
  }
  clear() {
    this._logger.debug("clear");
    this._data = {};
  }
  getItem(key) {
    this._logger.debug("getItem", key);
    return this._data[key];
  }
  setItem(key, value) {
    this._logger.debug("setItem", key);
    this._data[key] = value;
  }
  removeItem(key) {
    this._logger.debug("removeItem", key);
    delete this._data[key];
  }
  get length() {
    return Object.getOwnPropertyNames(this._data).length;
  }
  key(index) {
    return Object.getOwnPropertyNames(this._data)[index];
  }
};

// src/JsonService.ts
var JsonService = class {
  constructor(additionalContentTypes = [], _jwtHandler = null) {
    this._jwtHandler = _jwtHandler;
    this._contentTypes = [];
    this._logger = new Logger("JsonService");
    this._contentTypes.push(...additionalContentTypes, "application/json");
    if (_jwtHandler) {
      this._contentTypes.push("application/jwt");
    }
  }
  async getJson(url, token) {
    const headers = {
      "Accept": this._contentTypes.join(", ")
    };
    if (token) {
      this._logger.debug("getJson: token passed, setting Authorization header");
      headers["Authorization"] = "Bearer " + token;
    }
    let response;
    try {
      this._logger.debug("getJson, url:", url);
      response = await fetch(url, { method: "GET", headers });
    } catch (err) {
      this._logger.error("getJson: network error");
      throw new Error("Network Error");
    }
    this._logger.debug("getJson: HTTP response received, status", response.status);
    const contentType = response.headers.get("Content-Type");
    if (contentType && !this._contentTypes.find((item) => contentType.startsWith(item))) {
      throw new Error(`Invalid response Content-Type: ${contentType != null ? contentType : "undefined"}, from URL: ${url}`);
    }
    if (response.ok && this._jwtHandler && (contentType == null ? void 0 : contentType.startsWith("application/jwt"))) {
      return await this._jwtHandler(await response.text());
    }
    let json;
    try {
      json = await response.json();
    } catch (err) {
      this._logger.error("getJson: Error parsing JSON response", err);
      if (response.ok)
        throw err;
      throw new Error(`${response.statusText} (${response.status})`);
    }
    if (!response.ok) {
      this._logger.error("getJson: Error from server:", json);
      if (json.error) {
        throw new ErrorResponse(json);
      }
      throw new Error(`${response.statusText} (${response.status}): ${JSON.stringify(json)}`);
    }
    return json;
  }
  async postForm(url, body, basicAuth) {
    const headers = {
      "Accept": this._contentTypes.join(", "),
      "Content-Type": "application/x-www-form-urlencoded"
    };
    if (basicAuth !== void 0) {
      headers["Authorization"] = "Basic " + basicAuth;
    }
    let response;
    try {
      this._logger.debug("postForm, url:", url);
      response = await fetch(url, { method: "POST", headers, body });
    } catch (err) {
      this._logger.error("postForm: network error");
      throw new Error("Network Error");
    }
    this._logger.debug("postForm: HTTP response received, status", response.status);
    const contentType = response.headers.get("Content-Type");
    if (contentType && !this._contentTypes.find((item) => contentType.startsWith(item))) {
      throw new Error(`Invalid response Content-Type: ${contentType != null ? contentType : "undefined"}, from URL: ${url}`);
    }
    const responseText = await response.text();
    let json = {};
    try {
      json = JSON.parse(responseText);
    } catch (err) {
      this._logger.error("postForm: Error parsing JSON response", err);
      if (response.ok)
        throw err;
      throw new Error(`${response.statusText} (${response.status})`);
    }
    if (!response.ok) {
      this._logger.error("postForm: Error from server:", json);
      if (json.error) {
        throw new ErrorResponse(json);
      }
      throw new Error(`${response.statusText} (${response.status}): ${JSON.stringify(json)}`);
    }
    return json;
  }
};

// src/MetadataService.ts
var OidcMetadataUrlPath = ".well-known/openid-configuration";
var MetadataService = class {
  constructor(settings) {
    this._settings = settings;
    this._logger = new Logger("MetadataService");
    this._jsonService = new JsonService(["application/jwk-set+json"]);
    this._metadataUrl = null;
    if (this._settings.metadataUrl) {
      this._metadataUrl = this._settings.metadataUrl;
    } else if (this._settings.authority) {
      this._metadataUrl = this._settings.authority;
      if (this._metadataUrl[this._metadataUrl.length - 1] !== "/") {
        this._metadataUrl += "/";
      }
      this._metadataUrl += OidcMetadataUrlPath;
    }
    this._signingKeys = null;
    if (this._settings.signingKeys) {
      this._logger.debug("ctor: Using signingKeys from settings");
      this._signingKeys = this._settings.signingKeys;
    }
    this._metadata = null;
    if (this._settings.metadata) {
      this._logger.debug("ctor: Using metadata from settings");
      this._metadata = this._settings.metadata;
    }
  }
  resetSigningKeys() {
    this._signingKeys = null;
  }
  async getMetadata() {
    if (this._metadata) {
      this._logger.debug("getMetadata: Returning metadata from cache");
      return this._metadata;
    }
    if (!this._metadataUrl) {
      this._logger.error("getMetadata: No authority or metadataUrl configured on settings");
      throw new Error("No authority or metadataUrl configured on settings");
    }
    this._logger.debug("getMetadata: getting metadata from", this._metadataUrl);
    const metadata = await this._jsonService.getJson(this._metadataUrl);
    this._logger.debug("getMetadata: json received");
    const seed = this._settings.metadataSeed || {};
    this._metadata = Object.assign({}, seed, metadata);
    return this._metadata;
  }
  getIssuer() {
    return this._getMetadataProperty("issuer");
  }
  getAuthorizationEndpoint() {
    return this._getMetadataProperty("authorization_endpoint");
  }
  getUserInfoEndpoint() {
    return this._getMetadataProperty("userinfo_endpoint");
  }
  getTokenEndpoint(optional = true) {
    return this._getMetadataProperty("token_endpoint", optional);
  }
  getCheckSessionIframe() {
    return this._getMetadataProperty("check_session_iframe", true);
  }
  getEndSessionEndpoint() {
    return this._getMetadataProperty("end_session_endpoint", true);
  }
  getRevocationEndpoint(optional = true) {
    return this._getMetadataProperty("revocation_endpoint", optional);
  }
  getKeysEndpoint(optional = true) {
    return this._getMetadataProperty("jwks_uri", optional);
  }
  async _getMetadataProperty(name, optional = false) {
    this._logger.debug("getMetadataProperty for: " + name);
    const metadata = await this.getMetadata();
    this._logger.debug("getMetadataProperty: metadata received");
    if (metadata[name] === void 0) {
      if (optional === true) {
        this._logger.warn("getMetadataProperty: Metadata does not contain optional property " + name);
        return void 0;
      }
      this._logger.error("getMetadataProperty: Metadata does not contain property " + name);
      throw new Error("Metadata does not contain property " + name);
    }
    return metadata[name];
  }
  async getSigningKeys() {
    if (this._signingKeys) {
      this._logger.debug("getSigningKeys: Returning signingKeys from cache");
      return this._signingKeys;
    }
    const jwks_uri = await this.getKeysEndpoint(false);
    this._logger.debug("getSigningKeys: jwks_uri received", jwks_uri);
    const keySet = await this._jsonService.getJson(jwks_uri);
    this._logger.debug("getSigningKeys: key set received", keySet);
    if (!Array.isArray(keySet.keys)) {
      this._logger.error("getSigningKeys: Missing keys on keyset");
      throw new Error("Missing keys on keyset");
    }
    this._signingKeys = keySet.keys;
    return this._signingKeys;
  }
};

// src/WebStorageStateStore.ts
var WebStorageStateStore = class {
  constructor({ prefix = "oidc.", store = localStorage } = {}) {
    this._logger = new Logger("WebStorageStateStore");
    this._store = store;
    this._prefix = prefix;
  }
  set(key, value) {
    this._logger.debug("set", key);
    key = this._prefix + key;
    this._store.setItem(key, value);
    return Promise.resolve();
  }
  get(key) {
    this._logger.debug("get", key);
    key = this._prefix + key;
    const item = this._store.getItem(key);
    return Promise.resolve(item);
  }
  remove(key) {
    this._logger.debug("remove", key);
    key = this._prefix + key;
    const item = this._store.getItem(key);
    this._store.removeItem(key);
    return Promise.resolve(item);
  }
  getAllKeys() {
    this._logger.debug("getAllKeys");
    const keys = [];
    for (let index = 0; index < this._store.length; index++) {
      const key = this._store.key(index);
      if (key && key.indexOf(this._prefix) === 0) {
        keys.push(key.substr(this._prefix.length));
      }
    }
    return Promise.resolve(keys);
  }
};

// src/OidcClientSettings.ts
var DefaultResponseType = "code";
var DefaultScope = "openid";
var DefaultClientAuthentication = "client_secret_post";
var DefaultResponseMode = "query";
var DefaultStaleStateAgeInSeconds = 60 * 15;
var DefaultClockSkewInSeconds = 60 * 5;
var OidcClientSettingsStore = class {
  constructor({
    authority,
    metadataUrl,
    metadata,
    signingKeys,
    metadataSeed,
    client_id,
    client_secret,
    response_type = DefaultResponseType,
    scope = DefaultScope,
    redirect_uri,
    post_logout_redirect_uri,
    client_authentication = DefaultClientAuthentication,
    prompt,
    display,
    max_age,
    ui_locales,
    acr_values,
    resource,
    response_mode = DefaultResponseMode,
    filterProtocolClaims = true,
    loadUserInfo = false,
    staleStateAgeInSeconds = DefaultStaleStateAgeInSeconds,
    clockSkewInSeconds = DefaultClockSkewInSeconds,
    userInfoJwtIssuer = "OP",
    mergeClaims = false,
    stateStore = new WebStorageStateStore(),
    extraQueryParams = {},
    extraTokenParams = {}
  }) {
    this.authority = authority;
    this.metadataUrl = metadataUrl;
    this.metadata = metadata;
    this.metadataSeed = metadataSeed;
    this.signingKeys = signingKeys;
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.response_type = response_type;
    this.scope = scope;
    this.redirect_uri = redirect_uri;
    this.post_logout_redirect_uri = post_logout_redirect_uri;
    this.client_authentication = client_authentication;
    this.prompt = prompt;
    this.display = display;
    this.max_age = max_age;
    this.ui_locales = ui_locales;
    this.acr_values = acr_values;
    this.resource = resource;
    this.response_mode = response_mode;
    this.filterProtocolClaims = !!filterProtocolClaims;
    this.loadUserInfo = !!loadUserInfo;
    this.staleStateAgeInSeconds = staleStateAgeInSeconds;
    this.clockSkewInSeconds = clockSkewInSeconds;
    this.userInfoJwtIssuer = userInfoJwtIssuer;
    this.mergeClaims = !!mergeClaims;
    this.stateStore = stateStore;
    this.extraQueryParams = extraQueryParams;
    this.extraTokenParams = extraTokenParams;
  }
};

// src/UserInfoService.ts
var UserInfoService = class {
  constructor(metadataService) {
    this._getClaimsFromJwt = async (responseText) => {
      try {
        const payload = JwtUtils.decode(responseText);
        this._logger.debug("_getClaimsFromJwt: JWT decoding successful");
        return payload;
      } catch (err) {
        this._logger.error("_getClaimsFromJwt: Error parsing JWT response", err instanceof Error ? err.message : err);
        throw err;
      }
    };
    this._logger = new Logger("UserInfoService");
    this._jsonService = new JsonService(void 0, this._getClaimsFromJwt);
    this._metadataService = metadataService;
  }
  async getClaims(token) {
    if (!token) {
      this._logger.error("getClaims: No token passed");
      throw new Error("A token is required");
    }
    const url = await this._metadataService.getUserInfoEndpoint();
    this._logger.debug("getClaims: received userinfo url", url);
    const claims = await this._jsonService.getJson(url, token);
    this._logger.debug("getClaims: claims received", claims);
    return claims;
  }
};

// src/TokenClient.ts
var TokenClient = class {
  constructor(settings, metadataService) {
    this._settings = settings;
    this._logger = new Logger("TokenClient");
    this._jsonService = new JsonService();
    this._metadataService = metadataService;
  }
  async exchangeCode({
    grant_type = "authorization_code",
    redirect_uri = this._settings.redirect_uri,
    client_id = this._settings.client_id,
    client_secret = this._settings.client_secret,
    ...args
  }) {
    if (!client_id) {
      this._logger.error("exchangeCode: No client_id passed");
      throw new Error("A client_id is required");
    }
    if (!redirect_uri) {
      this._logger.error("exchangeCode: No redirect_uri passed");
      throw new Error("A redirect_uri is required");
    }
    if (!args.code) {
      this._logger.error("exchangeCode: No code passed");
      throw new Error("A code is required");
    }
    if (!args.code_verifier) {
      this._logger.error("exchangeCode: No code_verifier passed");
      throw new Error("A code_verifier is required");
    }
    const params = new URLSearchParams({ grant_type, redirect_uri });
    for (const [key, value] of Object.entries(args)) {
      if (value != null) {
        params.set(key, value);
      }
    }
    let basicAuth;
    switch (this._settings.client_authentication) {
      case "client_secret_basic":
        if (!client_secret) {
          this._logger.error("exchangeCode: No client_secret passed");
          throw new Error("A client_secret is required");
        }
        basicAuth = CryptoUtils.generateBasicAuth(client_id, client_secret);
        break;
      case "client_secret_post":
        params.append("client_id", client_id);
        if (client_secret) {
          params.append("client_secret", client_id);
        }
        break;
    }
    const url = await this._metadataService.getTokenEndpoint(false);
    this._logger.debug("exchangeCode: Received token endpoint");
    const response = await this._jsonService.postForm(url, params, basicAuth);
    this._logger.debug("exchangeCode: response received");
    return response;
  }
  async exchangeRefreshToken({
    grant_type = "refresh_token",
    client_id = this._settings.client_id,
    client_secret = this._settings.client_secret,
    ...args
  }) {
    if (!client_id) {
      this._logger.error("exchangeRefreshToken: No client_id passed");
      throw new Error("A client_id is required");
    }
    if (!args.refresh_token) {
      this._logger.error("exchangeRefreshToken: No refresh_token passed");
      throw new Error("A refresh_token is required");
    }
    const params = new URLSearchParams({ grant_type });
    for (const [key, value] of Object.entries(args)) {
      if (value != null) {
        params.set(key, value);
      }
    }
    let basicAuth;
    switch (this._settings.client_authentication) {
      case "client_secret_basic":
        if (!client_secret) {
          this._logger.error("exchangeCode: No client_secret passed");
          throw new Error("A client_secret is required");
        }
        basicAuth = CryptoUtils.generateBasicAuth(client_id, client_secret);
        break;
      case "client_secret_post":
        params.append("client_id", client_id);
        if (client_secret) {
          params.append("client_secret", client_id);
        }
        break;
    }
    const url = await this._metadataService.getTokenEndpoint(false);
    this._logger.debug("exchangeRefreshToken: Received token endpoint");
    const response = await this._jsonService.postForm(url, params, basicAuth);
    this._logger.debug("exchangeRefreshToken: response received");
    return response;
  }
  async revoke({
    optional = false,
    ...args
  }) {
    if (!args.token) {
      this._logger.error("revoke: No token passed");
      throw new Error("A token is required");
    }
    const url = await this._metadataService.getRevocationEndpoint(optional);
    if (!url) {
      return;
    }
    this._logger.debug("revoke: Received revocation endpoint, revoking " + args.token_type_hint);
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(args)) {
      if (value != null) {
        params.set(key, value);
      }
    }
    params.set("client_id", this._settings.client_id);
    if (this._settings.client_secret) {
      params.set("client_secret", this._settings.client_secret);
    }
    await this._jsonService.postForm(url, params);
    this._logger.debug("revoke: response received");
  }
};

// src/ResponseValidator.ts
var ProtocolClaims = ["at_hash", "iat", "nbf", "exp", "aud", "iss", "c_hash"];
var ResponseValidator = class {
  constructor(settings, metadataService) {
    this._settings = settings;
    this._logger = new Logger("ResponseValidator");
    this._metadataService = metadataService;
    this._userInfoService = new UserInfoService(metadataService);
    this._tokenClient = new TokenClient(this._settings, metadataService);
  }
  async validateSigninResponse(state, response) {
    this._logger.debug("validateSigninResponse");
    response = this._processSigninParams(state, response);
    this._logger.debug("validateSigninResponse: state processed");
    response = await this._validateTokens(state, response);
    this._logger.debug("validateSigninResponse: tokens validated");
    response = await this._processClaims(state, response);
    this._logger.debug("validateSigninResponse: claims processed");
    return response;
  }
  validateSignoutResponse(state, response) {
    if (state.id !== response.state_id) {
      this._logger.error("validateSignoutResponse: State does not match");
      throw new Error("State does not match");
    }
    this._logger.debug("validateSignoutResponse: state validated");
    response.state = state.data;
    if (response.error) {
      this._logger.warn("validateSignoutResponse: Response was error", response.error);
      throw new ErrorResponse(response);
    }
    return response;
  }
  _processSigninParams(state, response) {
    if (state.id !== response.state_id) {
      this._logger.error("_processSigninParams: State does not match");
      throw new Error("State does not match");
    }
    if (!state.client_id) {
      this._logger.error("_processSigninParams: No client_id on state");
      throw new Error("No client_id on state");
    }
    if (!state.authority) {
      this._logger.error("_processSigninParams: No authority on state");
      throw new Error("No authority on state");
    }
    if (this._settings.authority !== state.authority) {
      this._logger.error("_processSigninParams: authority mismatch on settings vs. signin state");
      throw new Error("authority mismatch on settings vs. signin state");
    }
    if (this._settings.client_id && this._settings.client_id !== state.client_id) {
      this._logger.error("_processSigninParams: client_id mismatch on settings vs. signin state");
      throw new Error("client_id mismatch on settings vs. signin state");
    }
    this._logger.debug("_processSigninParams: state validated");
    response.state = state.data;
    if (response.error) {
      this._logger.warn("_processSigninParams: Response was error", response.error);
      throw new ErrorResponse(response);
    }
    if (state.code_verifier && !response.code) {
      this._logger.error("_processSigninParams: Expecting code in response");
      throw new Error("No code in response");
    }
    if (!state.code_verifier && response.code) {
      this._logger.error("_processSigninParams: Not expecting code in response");
      throw new Error("Unexpected code in response");
    }
    if (!response.scope) {
      response.scope = state.scope;
    }
    return response;
  }
  async _processClaims(state, response) {
    if (response.isOpenIdConnect) {
      this._logger.debug("_processClaims: response is OIDC, processing claims");
      response.profile = this._filterProtocolClaims(response.profile);
      if (state.skipUserInfo !== true && this._settings.loadUserInfo && response.access_token) {
        this._logger.debug("_processClaims: loading user info");
        const claims = await this._userInfoService.getClaims(response.access_token);
        this._logger.debug("_processClaims: user info claims received from user info endpoint");
        if (claims.sub !== response.profile.sub) {
          this._logger.error("_processClaims: sub from user info endpoint does not match sub in id_token");
          throw new Error("sub from user info endpoint does not match sub in id_token");
        }
        response.profile = this._mergeClaims(response.profile, claims);
        this._logger.debug("_processClaims: user info claims received, updated profile:", response.profile);
        return response;
      } else {
        this._logger.debug("_processClaims: not loading user info");
      }
    } else {
      this._logger.debug("_processClaims: response is not OIDC, not processing claims");
    }
    return response;
  }
  _mergeClaims(claims1, claims2) {
    const result = Object.assign({}, claims1);
    for (const name in claims2) {
      let values = claims2[name];
      if (!Array.isArray(values)) {
        values = [values];
      }
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (!result[name]) {
          result[name] = value;
        } else if (Array.isArray(result[name])) {
          if (result[name].indexOf(value) < 0) {
            result[name].push(value);
          }
        } else if (result[name] !== value) {
          if (typeof value === "object" && this._settings.mergeClaims) {
            result[name] = this._mergeClaims(result[name], value);
          } else {
            result[name] = [result[name], value];
          }
        }
      }
    }
    return result;
  }
  _filterProtocolClaims(claims) {
    this._logger.debug("_filterProtocolClaims, incoming claims:", claims);
    const result = Object.assign({}, claims);
    if (this._settings.filterProtocolClaims) {
      ProtocolClaims.forEach((type) => {
        delete result[type];
      });
      this._logger.debug("_filterProtocolClaims: protocol claims filtered:", result);
    } else {
      this._logger.debug("_filterProtocolClaims: protocol claims not filtered");
    }
    return result;
  }
  async _validateTokens(state, response) {
    if (response.code) {
      this._logger.debug("_validateTokens: Validating code");
      return this._processCode(state, response);
    }
    this._logger.debug("_validateTokens: No code to process");
    return response;
  }
  async _processCode(state, response) {
    const request = {
      client_id: state.client_id,
      client_secret: state.client_secret,
      code: response.code,
      redirect_uri: state.redirect_uri,
      code_verifier: state.code_verifier || ""
    };
    if (state.extraTokenParams && typeof state.extraTokenParams === "object") {
      Object.assign(request, state.extraTokenParams);
    }
    const { expires_in, ...tokenResponse } = await this._tokenClient.exchangeCode(request);
    Object.assign(response, tokenResponse);
    if (expires_in)
      response.expires_in = Number(expires_in);
    if (response.id_token) {
      this._logger.debug("_processCode: token response successful, processing id_token");
      return this._validateIdTokenAttributes(response, response.id_token);
    }
    this._logger.debug("_processCode: token response successful, returning response");
    return response;
  }
  _validateIdTokenAttributes(response, id_token) {
    this._logger.debug("_validateIdTokenAttributes: Decoding JWT attributes");
    const payload = JwtUtils.decode(id_token);
    if (!payload.sub) {
      this._logger.error("_validateIdTokenAttributes: No sub present in id_token");
      throw new Error("No sub present in id_token");
    }
    response.profile = payload;
    return response;
  }
};

// src/State.ts
var State = class {
  constructor(args) {
    this.id = args.id || CryptoUtils.generateUUIDv4();
    this.data = args.data;
    if (args.created && args.created > 0) {
      this.created = args.created;
    } else {
      this.created = Timer.getEpochTime();
    }
    this.request_type = args.request_type;
  }
  toStorageString() {
    Logger.debug("State", "toStorageString");
    return JSON.stringify({
      id: this.id,
      data: this.data,
      created: this.created,
      request_type: this.request_type
    });
  }
  static fromStorageString(storageString) {
    Logger.debug("State", "fromStorageString");
    return new State(JSON.parse(storageString));
  }
  static async clearStaleState(storage, age) {
    const cutoff = Timer.getEpochTime() - age;
    const keys = await storage.getAllKeys();
    Logger.debug("State", "clearStaleState: got keys", keys);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const item = await storage.get(key);
      let remove = false;
      if (item) {
        try {
          const state = State.fromStorageString(item);
          Logger.debug("State", "clearStaleState: got item from key: ", key, state.created);
          if (state.created <= cutoff) {
            remove = true;
          }
        } catch (err) {
          Logger.error("State", "clearStaleState: Error parsing state for key", key, err instanceof Error ? err.message : err);
          remove = true;
        }
      } else {
        Logger.debug("State", "clearStaleState: no item in storage for key: ", key);
        remove = true;
      }
      if (remove) {
        Logger.debug("State", "clearStaleState: removed item for key: ", key);
        void storage.remove(key);
      }
    }
  }
};

// src/SigninState.ts
var SigninState = class extends State {
  constructor(args) {
    super(args);
    if (args.code_verifier === true) {
      this.code_verifier = CryptoUtils.generateCodeVerifier();
    } else if (args.code_verifier) {
      this.code_verifier = args.code_verifier;
    }
    if (this.code_verifier) {
      this.code_challenge = CryptoUtils.generateCodeChallenge(this.code_verifier);
    }
    this.authority = args.authority;
    this.client_id = args.client_id;
    this.redirect_uri = args.redirect_uri;
    this.scope = args.scope;
    this.client_secret = args.client_secret;
    this.extraTokenParams = args.extraTokenParams;
    this.response_mode = args.response_mode;
    this.skipUserInfo = args.skipUserInfo;
  }
  toStorageString() {
    Logger.debug("SigninState", "toStorageString");
    return JSON.stringify({
      id: this.id,
      data: this.data,
      created: this.created,
      request_type: this.request_type,
      code_verifier: this.code_verifier,
      authority: this.authority,
      client_id: this.client_id,
      redirect_uri: this.redirect_uri,
      scope: this.scope,
      client_secret: this.client_secret,
      extraTokenParams: this.extraTokenParams,
      response_mode: this.response_mode,
      skipUserInfo: this.skipUserInfo
    });
  }
  static fromStorageString(storageString) {
    Logger.debug("SigninState", "fromStorageString");
    const data = JSON.parse(storageString);
    return new SigninState(data);
  }
};

// src/SigninRequest.ts
var SigninRequest = class {
  constructor({
    url,
    authority,
    client_id,
    redirect_uri,
    response_type,
    scope,
    state_data,
    response_mode,
    request_type,
    client_secret,
    skipUserInfo,
    extraQueryParams,
    extraTokenParams,
    ...optionalParams
  }) {
    this._logger = new Logger("SigninRequest");
    if (!url) {
      this._logger.error("ctor: No url passed");
      throw new Error("url");
    }
    if (!client_id) {
      this._logger.error("ctor: No client_id passed");
      throw new Error("client_id");
    }
    if (!redirect_uri) {
      this._logger.error("ctor: No redirect_uri passed");
      throw new Error("redirect_uri");
    }
    if (!response_type) {
      this._logger.error("ctor: No response_type passed");
      throw new Error("response_type");
    }
    if (!scope) {
      this._logger.error("ctor: No scope passed");
      throw new Error("scope");
    }
    if (!authority) {
      this._logger.error("ctor: No authority passed");
      throw new Error("authority");
    }
    this.state = new SigninState({
      data: state_data,
      request_type,
      code_verifier: true,
      client_id,
      authority,
      redirect_uri,
      response_mode,
      client_secret,
      scope,
      extraTokenParams,
      skipUserInfo
    });
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.append("client_id", client_id);
    parsedUrl.searchParams.append("redirect_uri", redirect_uri);
    parsedUrl.searchParams.append("response_type", response_type);
    parsedUrl.searchParams.append("scope", scope);
    parsedUrl.searchParams.append("state", this.state.id);
    if (this.state.code_challenge) {
      parsedUrl.searchParams.append("code_challenge", this.state.code_challenge);
      parsedUrl.searchParams.append("code_challenge_method", "S256");
    }
    for (const [key, value] of Object.entries({ response_mode, ...optionalParams, ...extraQueryParams })) {
      if (value != null) {
        parsedUrl.searchParams.append(key, value.toString());
      }
    }
    this.url = parsedUrl.href;
  }
};

// src/SigninResponse.ts
var OidcScope = "openid";
var SigninResponse = class {
  constructor(params) {
    this.profile = {};
    var _a, _b, _c;
    const values = new Map(params);
    this.error = values.get("error");
    this.error_description = values.get("error_description");
    this.error_uri = values.get("error_uri");
    this.code = (_a = values.get("code")) != null ? _a : "";
    this.access_token = (_b = values.get("access_token")) != null ? _b : "";
    this.token_type = (_c = values.get("token_type")) != null ? _c : "";
    this.state_id = values.get("state");
    this.id_token = values.get("id_token");
    this.session_state = values.get("session_state");
    this.refresh_token = values.get("refresh_token");
    this.scope = values.get("scope");
    const expiresIn = values.get("expires_in");
    this.expires_in = expiresIn ? parseInt(expiresIn) : void 0;
  }
  get expires_in() {
    if (this.expires_at) {
      const now = Timer.getEpochTime();
      return this.expires_at - now;
    }
    return void 0;
  }
  set expires_in(value) {
    if (value && value > 0) {
      const expires_in = Math.floor(value);
      const now = Timer.getEpochTime();
      this.expires_at = now + expires_in;
    }
  }
  get expired() {
    const expires_in = this.expires_in;
    if (expires_in !== void 0) {
      return expires_in <= 0;
    }
    return void 0;
  }
  get scopes() {
    return (this.scope || "").split(" ");
  }
  get isOpenIdConnect() {
    return this.scopes.indexOf(OidcScope) >= 0 || !!this.id_token;
  }
};

// src/SignoutRequest.ts
var SignoutRequest = class {
  constructor({
    url,
    state_data,
    id_token_hint,
    post_logout_redirect_uri,
    extraQueryParams,
    request_type
  }) {
    this._logger = new Logger("SignoutRequest");
    if (!url) {
      this._logger.error("ctor: No url passed");
      throw new Error("url");
    }
    const parsedUrl = new URL(url);
    if (id_token_hint) {
      parsedUrl.searchParams.append("id_token_hint", id_token_hint);
    }
    if (post_logout_redirect_uri) {
      parsedUrl.searchParams.append("post_logout_redirect_uri", post_logout_redirect_uri);
      if (state_data) {
        this.state = new State({ data: state_data, request_type });
        parsedUrl.searchParams.append("state", this.state.id);
      }
    }
    for (const [key, value] of Object.entries({ ...extraQueryParams })) {
      if (value != null) {
        parsedUrl.searchParams.append(key, value.toString());
      }
    }
    this.url = parsedUrl.href;
  }
};

// src/SignoutResponse.ts
var SignoutResponse = class {
  constructor(params) {
    const values = new Map(params);
    this.error = values.get("error");
    this.error_description = values.get("error_description");
    this.error_uri = values.get("error_uri");
    this.state_id = values.get("state");
  }
};

// src/OidcClient.ts
var OidcClient = class {
  constructor(settings) {
    this.settings = new OidcClientSettingsStore(settings);
    this._logger = new Logger("OidcClient");
    this.metadataService = new MetadataService(this.settings);
    this._validator = new ResponseValidator(this.settings, this.metadataService);
  }
  async createSigninRequest({
    response_type,
    scope,
    redirect_uri,
    state,
    prompt,
    display,
    max_age,
    ui_locales,
    id_token_hint,
    login_hint,
    acr_values,
    resource,
    request,
    request_uri,
    response_mode,
    extraQueryParams,
    extraTokenParams,
    request_type,
    skipUserInfo
  }) {
    this._logger.debug("createSigninRequest");
    response_type = response_type || this.settings.response_type;
    scope = scope || this.settings.scope;
    redirect_uri = redirect_uri || this.settings.redirect_uri;
    prompt = prompt || this.settings.prompt;
    display = display || this.settings.display;
    max_age = max_age || this.settings.max_age;
    ui_locales = ui_locales || this.settings.ui_locales;
    acr_values = acr_values || this.settings.acr_values;
    resource = resource || this.settings.resource;
    response_mode = response_mode || this.settings.response_mode;
    extraQueryParams = extraQueryParams || this.settings.extraQueryParams;
    extraTokenParams = extraTokenParams || this.settings.extraTokenParams;
    if (response_type !== "code") {
      throw new Error("Only the Authorization Code flow (with PKCE) is supported");
    }
    const url = await this.metadataService.getAuthorizationEndpoint();
    this._logger.debug("createSigninRequest: Received authorization endpoint", url);
    const signinRequest = new SigninRequest({
      url,
      authority: this.settings.authority,
      client_id: this.settings.client_id,
      redirect_uri,
      response_type,
      scope,
      state_data: state,
      prompt,
      display,
      max_age,
      ui_locales,
      id_token_hint,
      login_hint,
      acr_values,
      resource,
      request,
      request_uri,
      extraQueryParams,
      extraTokenParams,
      request_type,
      response_mode,
      client_secret: this.settings.client_secret,
      skipUserInfo
    });
    const signinState = signinRequest.state;
    await this.settings.stateStore.set(signinState.id, signinState.toStorageString());
    return signinRequest;
  }
  async readSigninResponseState(url, removeState = false) {
    this._logger.debug("readSigninResponseState");
    const response = new SigninResponse(UrlUtils.readParams(url, this.settings.response_mode));
    const stateKey = response.state_id;
    if (!stateKey) {
      this._logger.error("readSigninResponseState: No state in response");
      throw new Error("No state in response");
    }
    const stateStore = this.settings.stateStore;
    const stateApi = removeState ? stateStore.remove.bind(stateStore) : stateStore.get.bind(stateStore);
    const storedStateString = await stateApi(stateKey);
    if (!storedStateString) {
      this._logger.error("readSigninResponseState: No matching state found in storage");
      throw new Error("No matching state found in storage");
    }
    const state = SigninState.fromStorageString(storedStateString);
    return { state, response };
  }
  async processSigninResponse(url) {
    this._logger.debug("processSigninResponse");
    const { state, response } = await this.readSigninResponseState(url, true);
    this._logger.debug("processSigninResponse: Received state from storage; validating response");
    return await this._validator.validateSigninResponse(state, response);
  }
  async createSignoutRequest({
    state,
    id_token_hint,
    post_logout_redirect_uri,
    extraQueryParams,
    request_type
  } = {}) {
    this._logger.debug("createSignoutRequest");
    post_logout_redirect_uri = post_logout_redirect_uri || this.settings.post_logout_redirect_uri;
    extraQueryParams = extraQueryParams || this.settings.extraQueryParams;
    const url = await this.metadataService.getEndSessionEndpoint();
    if (!url) {
      this._logger.error("createSignoutRequest: No end session endpoint url returned");
      throw new Error("no end session endpoint");
    }
    this._logger.debug("createSignoutRequest: Received end session endpoint", url);
    const request = new SignoutRequest({
      url,
      id_token_hint,
      post_logout_redirect_uri,
      state_data: state,
      extraQueryParams,
      request_type
    });
    const signoutState = request.state;
    if (signoutState) {
      this._logger.debug("createSignoutRequest: Signout request has state to persist");
      await this.settings.stateStore.set(signoutState.id, signoutState.toStorageString());
    }
    return request;
  }
  async readSignoutResponseState(url, removeState = false) {
    this._logger.debug("readSignoutResponseState");
    const response = new SignoutResponse(UrlUtils.readParams(url, this.settings.response_mode));
    const stateKey = response.state_id;
    if (!stateKey) {
      this._logger.debug("readSignoutResponseState: No state in response");
      if (response.error) {
        this._logger.warn("readSignoutResponseState: Response was error:", response.error);
        throw new ErrorResponse(response);
      }
      return { state: void 0, response };
    }
    const stateStore = this.settings.stateStore;
    const stateApi = removeState ? stateStore.remove.bind(stateStore) : stateStore.get.bind(stateStore);
    const storedStateString = await stateApi(stateKey);
    if (!storedStateString) {
      this._logger.error("readSignoutResponseState: No matching state found in storage");
      throw new Error("No matching state found in storage");
    }
    const state = State.fromStorageString(storedStateString);
    return { state, response };
  }
  async processSignoutResponse(url) {
    this._logger.debug("processSignoutResponse");
    const { state, response } = await this.readSignoutResponseState(url, true);
    if (state) {
      this._logger.debug("processSignoutResponse: Received state from storage; validating response");
      return this._validator.validateSignoutResponse(state, response);
    }
    this._logger.debug("processSignoutResponse: No state from storage; skipping validating response");
    return response;
  }
  clearStaleState() {
    this._logger.debug("clearStaleState");
    return State.clearStaleState(this.settings.stateStore, this.settings.staleStateAgeInSeconds);
  }
};

// src/SessionMonitor.ts
var SessionMonitor = class {
  constructor(userManager) {
    this._start = async (user) => {
      const session_state = user.session_state;
      if (!session_state) {
        return;
      }
      if (user.profile) {
        this._sub = user.profile.sub;
        this._sid = user.profile.sid;
        this._logger.debug("_start: session_state:", session_state, ", sub:", this._sub);
      } else {
        this._sub = void 0;
        this._sid = void 0;
        this._logger.debug("_start: session_state:", session_state, ", anonymous user");
      }
      if (this._checkSessionIFrame) {
        this._checkSessionIFrame.start(session_state);
        return;
      }
      try {
        const url = await this._userManager.metadataService.getCheckSessionIframe();
        if (url) {
          this._logger.debug("_start: Initializing check session iframe");
          const client_id = this._userManager.settings.client_id;
          const intervalInSeconds = this._userManager.settings.checkSessionIntervalInSeconds;
          const stopOnError = this._userManager.settings.stopCheckSessionOnError;
          const checkSessionIFrame = new CheckSessionIFrame(this._callback, client_id, url, intervalInSeconds, stopOnError);
          await checkSessionIFrame.load();
          this._checkSessionIFrame = checkSessionIFrame;
          checkSessionIFrame.start(session_state);
        } else {
          this._logger.warn("_start: No check session iframe found in the metadata");
        }
      } catch (err) {
        this._logger.error("_start: Error from getCheckSessionIframe:", err instanceof Error ? err.message : err);
      }
    };
    this._stop = () => {
      this._sub = void 0;
      this._sid = void 0;
      if (this._checkSessionIFrame) {
        this._logger.debug("_stop");
        this._checkSessionIFrame.stop();
      }
      if (this._userManager.settings.monitorAnonymousSession) {
        const timerHandle = this._timer.setInterval(async () => {
          this._timer.clearInterval(timerHandle);
          try {
            const session = await this._userManager.querySessionStatus();
            if (session) {
              const tmpUser = {
                session_state: session.session_state,
                profile: session.sub && session.sid ? {
                  sub: session.sub,
                  sid: session.sid
                } : null
              };
              void this._start(tmpUser);
            }
          } catch (err) {
            this._logger.error("_stop: error from querySessionStatus:", err instanceof Error ? err.message : err);
          }
        }, 1e3);
      }
    };
    this._callback = async () => {
      try {
        const session = await this._userManager.querySessionStatus();
        let raiseEvent = true;
        if (session && this._checkSessionIFrame) {
          if (session.sub === this._sub) {
            raiseEvent = false;
            this._checkSessionIFrame.start(session.session_state);
            if (session.sid === this._sid) {
              this._logger.debug("_callback: Same sub still logged in at OP, restarting check session iframe; session_state:", session.session_state);
            } else {
              this._logger.debug("_callback: Same sub still logged in at OP, session state has changed, restarting check session iframe; session_state:", session.session_state);
              this._userManager.events._raiseUserSessionChanged();
            }
          } else {
            this._logger.debug("_callback: Different subject signed into OP:", session.sub);
          }
        } else {
          this._logger.debug("_callback: Subject no longer signed into OP");
        }
        if (raiseEvent) {
          if (this._sub) {
            this._logger.debug("_callback: SessionMonitor._callback; raising signed out event");
            this._userManager.events._raiseUserSignedOut();
          } else {
            this._logger.debug("_callback: SessionMonitor._callback; raising signed in event");
            this._userManager.events._raiseUserSignedIn();
          }
        }
      } catch (err) {
        if (this._sub) {
          this._logger.debug("_callback: Error calling queryCurrentSigninSession; raising signed out event", err instanceof Error ? err.message : err);
          this._userManager.events._raiseUserSignedOut();
        }
      }
    };
    this._logger = new Logger("SessionMonitor");
    if (!userManager) {
      this._logger.error("ctor: No user manager passed to SessionMonitor");
      throw new Error("userManager");
    }
    this._userManager = userManager;
    this._timer = g_timer;
    this._userManager.events.addUserLoaded(this._start);
    this._userManager.events.addUserUnloaded(this._stop);
    Promise.resolve(this._init()).catch((err) => {
      this._logger.error("ctor: error:", err.message);
    });
  }
  async _init() {
    const user = await this._userManager.getUser();
    if (user) {
      void this._start(user);
    } else if (this._userManager.settings.monitorAnonymousSession) {
      const session = await this._userManager.querySessionStatus();
      if (session) {
        const tmpUser = {
          session_state: session.session_state,
          profile: session.sub && session.sid ? {
            sub: session.sub,
            sid: session.sid
          } : null
        };
        void this._start(tmpUser);
      }
    }
  }
};

// src/User.ts
var User = class {
  constructor(args) {
    this.id_token = args.id_token;
    this.session_state = args.session_state;
    this.access_token = args.access_token;
    this.refresh_token = args.refresh_token;
    this.token_type = args.token_type;
    this.scope = args.scope;
    this.profile = args.profile;
    this.expires_at = args.expires_at;
    this.state = args.state;
  }
  get expires_in() {
    if (this.expires_at) {
      const now = Timer.getEpochTime();
      return this.expires_at - now;
    }
    return void 0;
  }
  set expires_in(value) {
    if (value && value > 0) {
      const expires_in = Math.floor(value);
      const now = Timer.getEpochTime();
      this.expires_at = now + expires_in;
    }
  }
  get expired() {
    const expires_in = this.expires_in;
    if (expires_in !== void 0) {
      return expires_in <= 0;
    }
    return void 0;
  }
  get scopes() {
    return (this.scope || "").split(" ");
  }
  toStorageString() {
    Logger.debug("User", "toStorageString");
    return JSON.stringify({
      id_token: this.id_token,
      session_state: this.session_state,
      access_token: this.access_token,
      refresh_token: this.refresh_token,
      token_type: this.token_type,
      scope: this.scope,
      profile: this.profile,
      expires_at: this.expires_at
    });
  }
  static fromStorageString(storageString) {
    Logger.debug("User", "fromStorageString");
    return new User(JSON.parse(storageString));
  }
};

// src/navigators/AbstractChildWindow.ts
var messageSource = "oidc-client";
var AbstractChildWindow = class {
  constructor() {
    this._abort = new Event("Window navigation aborted");
    this._disposeHandlers = /* @__PURE__ */ new Set();
    this._window = null;
  }
  async navigate(params) {
    if (!this._window) {
      throw new Error("Attempted to navigate on a disposed window");
    }
    this._logger.debug("navigate: Setting URL in window");
    this._window.location.replace(params.url);
    const { url, keepOpen } = await new Promise((resolve, reject) => {
      const listener = (e) => {
        var _a;
        if (e.origin !== window.location.origin || ((_a = e.data) == null ? void 0 : _a.source) !== messageSource) {
          return;
        }
        try {
          const state = UrlUtils.readParams(e.data.url, params.response_mode).get("state");
          if (!state) {
            this._logger.warn("navigate: no state found in response url");
          }
          if (e.source !== this._window && state !== params.state) {
            return;
          }
        } catch (err) {
          this._dispose();
          reject(new Error("Invalid response from window"));
        }
        resolve(e.data);
      };
      window.addEventListener("message", listener, false);
      this._disposeHandlers.add(() => window.removeEventListener("message", listener, false));
      this._disposeHandlers.add(this._abort.addHandler((reason) => {
        this._dispose();
        reject(reason);
      }));
    });
    this._logger.debug("navigate: Got response from window");
    this._dispose();
    if (!keepOpen) {
      this.close();
    }
    return { url };
  }
  _dispose() {
    this._logger.debug("_dispose");
    for (const dispose of this._disposeHandlers) {
      dispose();
    }
    this._disposeHandlers.clear();
  }
  static _notifyParent(parent, url, keepOpen = false) {
    parent.postMessage({
      source: messageSource,
      url,
      keepOpen
    }, window.location.origin);
  }
};

// src/navigators/IFrameWindow.ts
var defaultTimeoutInSeconds = 10;
var IFrameWindow = class extends AbstractChildWindow {
  constructor({
    silentRequestTimeoutInSeconds = defaultTimeoutInSeconds
  }) {
    super();
    this._logger = new Logger("IFrameWindow");
    this._timeoutInSeconds = silentRequestTimeoutInSeconds;
    this._frame = window.document.createElement("iframe");
    this._window = this._frame.contentWindow;
    this._frame.style.visibility = "hidden";
    this._frame.style.position = "fixed";
    this._frame.style.left = "-1000px";
    this._frame.style.top = "0";
    this._frame.width = "0";
    this._frame.height = "0";
    window.document.body.appendChild(this._frame);
    this._window = this._frame.contentWindow;
  }
  async navigate(params) {
    this._logger.debug("navigate: Using timeout of:", this._timeoutInSeconds);
    const timer = setTimeout(() => this._abort.raise(new Error("IFrame timed out without a response")), this._timeoutInSeconds * 1e3);
    this._disposeHandlers.add(() => clearTimeout(timer));
    return await super.navigate(params);
  }
  close() {
    if (this._frame) {
      if (this._frame.parentNode) {
        this._frame.parentNode.removeChild(this._frame);
      }
      this._abort.raise(new Error("IFrame removed from DOM"));
      this._frame = null;
    }
    this._window = null;
  }
  static notifyParent(url) {
    return super._notifyParent(window.parent, url);
  }
};

// src/navigators/IFrameNavigator.ts
var IFrameNavigator = class {
  constructor(_settings) {
    this._settings = _settings;
    this._logger = new Logger("IFrameNavigator");
  }
  async prepare({
    silentRequestTimeoutInSeconds = this._settings.silentRequestTimeoutInSeconds
  }) {
    return new IFrameWindow({ silentRequestTimeoutInSeconds });
  }
  async callback(url) {
    this._logger.debug("callback");
    IFrameWindow.notifyParent(url);
  }
};

// src/navigators/PopupWindow.ts
var checkForPopupClosedInterval = 500;
var defaultPopupWindowFeatures = {
  location: false,
  toolbar: false,
  height: 640
};
var defaultPopupTarget = "_blank";
var PopupWindow = class extends AbstractChildWindow {
  constructor({
    popupWindowTarget = defaultPopupTarget,
    popupWindowFeatures = {}
  }) {
    super();
    this._logger = new Logger("PopupWindow");
    const centeredPopup = PopupUtils.center({ ...defaultPopupWindowFeatures, ...popupWindowFeatures });
    this._window = window.open(void 0, popupWindowTarget, PopupUtils.serialize(centeredPopup));
  }
  async navigate(params) {
    var _a;
    (_a = this._window) == null ? void 0 : _a.focus();
    const popupClosedInterval = setInterval(() => {
      if (!this._window || this._window.closed) {
        this._abort.raise(new Error("Popup closed by user"));
      }
    }, checkForPopupClosedInterval);
    this._disposeHandlers.add(this._abort.addHandler(() => clearInterval(popupClosedInterval)));
    return await super.navigate(params);
  }
  close() {
    if (this._window) {
      if (!this._window.closed) {
        this._window.close();
      }
      this._abort.raise(new Error("Popup closed"));
    }
    this._window = null;
  }
  static notifyOpener(url, keepOpen) {
    if (!window.opener) {
      throw new Error("No window.opener. Can't complete notification.");
    }
    return super._notifyParent(window.opener, url, keepOpen);
  }
};

// src/navigators/PopupNavigator.ts
var PopupNavigator = class {
  constructor(_settings) {
    this._settings = _settings;
    this._logger = new Logger("PopupNavigator");
  }
  async prepare({
    popupWindowFeatures = this._settings.popupWindowFeatures,
    popupWindowTarget = this._settings.popupWindowTarget
  }) {
    return new PopupWindow({ popupWindowFeatures, popupWindowTarget });
  }
  async callback(url, keepOpen = false) {
    this._logger.debug("callback");
    PopupWindow.notifyOpener(url, keepOpen);
  }
};

// src/navigators/RedirectNavigator.ts
var RedirectNavigator = class {
  constructor(_settings) {
    this._settings = _settings;
    this._logger = new Logger("RedirectNavigator");
  }
  async prepare({
    redirectMethod = this._settings.redirectMethod
  }) {
    const redirect = window.location[redirectMethod].bind(window.location);
    return {
      navigate: (params) => redirect(params.url),
      close: () => this._logger.warn("close: cannot close the current window")
    };
  }
};

// src/UserManagerSettings.ts
var DefaultAccessTokenExpiringNotificationTimeInSeconds = 60;
var DefaultCheckSessionIntervalInSeconds = 2;
var UserManagerSettingsStore = class extends OidcClientSettingsStore {
  constructor(args) {
    const {
      popup_redirect_uri,
      popup_post_logout_redirect_uri,
      popupWindowFeatures,
      popupWindowTarget,
      redirectMethod = "assign",
      silent_redirect_uri,
      silentRequestTimeoutInSeconds,
      automaticSilentRenew = true,
      validateSubOnSilentRenew = true,
      includeIdTokenInSilentRenew = false,
      monitorSession = false,
      monitorAnonymousSession = false,
      checkSessionIntervalInSeconds = DefaultCheckSessionIntervalInSeconds,
      query_status_response_type,
      stopCheckSessionOnError = true,
      revokeAccessTokenOnSignout = false,
      accessTokenExpiringNotificationTimeInSeconds = DefaultAccessTokenExpiringNotificationTimeInSeconds,
      userStore = new WebStorageStateStore({ store: sessionStorage })
    } = args;
    super(args);
    this.popup_redirect_uri = popup_redirect_uri;
    this.popup_post_logout_redirect_uri = popup_post_logout_redirect_uri;
    this.popupWindowFeatures = popupWindowFeatures;
    this.popupWindowTarget = popupWindowTarget;
    this.redirectMethod = redirectMethod;
    this.silent_redirect_uri = silent_redirect_uri;
    this.silentRequestTimeoutInSeconds = silentRequestTimeoutInSeconds;
    this.automaticSilentRenew = automaticSilentRenew;
    this.validateSubOnSilentRenew = validateSubOnSilentRenew;
    this.includeIdTokenInSilentRenew = includeIdTokenInSilentRenew;
    this.monitorSession = monitorSession;
    this.monitorAnonymousSession = monitorAnonymousSession;
    this.checkSessionIntervalInSeconds = checkSessionIntervalInSeconds;
    this.stopCheckSessionOnError = stopCheckSessionOnError;
    if (query_status_response_type) {
      this.query_status_response_type = query_status_response_type;
    } else {
      this.query_status_response_type = "code";
    }
    this.revokeAccessTokenOnSignout = revokeAccessTokenOnSignout;
    this.accessTokenExpiringNotificationTimeInSeconds = accessTokenExpiringNotificationTimeInSeconds;
    this.userStore = userStore;
  }
};

// src/UserManagerEvents.ts
var UserManagerEvents = class extends AccessTokenEvents {
  constructor(settings) {
    super({ expiringNotificationTimeInSeconds: settings.accessTokenExpiringNotificationTimeInSeconds });
    this._logger = new Logger("UserManagerEvents");
    this._userLoaded = new Event("User loaded");
    this._userUnloaded = new Event("User unloaded");
    this._silentRenewError = new Event("Silent renew error");
    this._userSignedIn = new Event("User signed in");
    this._userSignedOut = new Event("User signed out");
    this._userSessionChanged = new Event("User session changed");
  }
  load(user, raiseEvent = true) {
    this._logger.debug("load");
    super.load(user);
    if (raiseEvent) {
      this._userLoaded.raise(user);
    }
  }
  unload() {
    this._logger.debug("unload");
    super.unload();
    this._userUnloaded.raise();
  }
  addUserLoaded(cb) {
    this._userLoaded.addHandler(cb);
  }
  removeUserLoaded(cb) {
    this._userLoaded.removeHandler(cb);
  }
  addUserUnloaded(cb) {
    this._userUnloaded.addHandler(cb);
  }
  removeUserUnloaded(cb) {
    this._userUnloaded.removeHandler(cb);
  }
  addSilentRenewError(cb) {
    this._silentRenewError.addHandler(cb);
  }
  removeSilentRenewError(cb) {
    this._silentRenewError.removeHandler(cb);
  }
  _raiseSilentRenewError(e) {
    this._logger.debug("_raiseSilentRenewError", e.message);
    this._silentRenewError.raise(e);
  }
  addUserSignedIn(cb) {
    this._userSignedIn.addHandler(cb);
  }
  removeUserSignedIn(cb) {
    this._userSignedIn.removeHandler(cb);
  }
  _raiseUserSignedIn() {
    this._logger.debug("_raiseUserSignedIn");
    this._userSignedIn.raise();
  }
  addUserSignedOut(cb) {
    this._userSignedOut.addHandler(cb);
  }
  removeUserSignedOut(cb) {
    this._userSignedOut.removeHandler(cb);
  }
  _raiseUserSignedOut() {
    this._logger.debug("_raiseUserSignedOut");
    this._userSignedOut.raise();
  }
  addUserSessionChanged(cb) {
    this._userSessionChanged.addHandler(cb);
  }
  removeUserSessionChanged(cb) {
    this._userSessionChanged.removeHandler(cb);
  }
  _raiseUserSessionChanged() {
    this._logger.debug("_raiseUserSessionChanged");
    this._userSessionChanged.raise();
  }
};

// src/SilentRenewService.ts
var SilentRenewService = class {
  constructor(_userManager) {
    this._userManager = _userManager;
    this._isStarted = false;
    this._tokenExpiring = () => {
      this._userManager.signinSilent().then(() => {
        this._logger.debug("_tokenExpiring: Silent token renewal successful");
      }).catch((err) => {
        const error = err instanceof Error ? err : new Error("Silent renew failed");
        this._logger.error("_tokenExpiring: Error from signinSilent:", error.message);
        this._userManager.events._raiseSilentRenewError(error);
      });
    };
    this._logger = new Logger("SilentRenewService");
  }
  async start() {
    if (!this._isStarted) {
      this._isStarted = true;
      this._userManager.events.addAccessTokenExpiring(this._tokenExpiring);
      try {
        await this._userManager.getUser();
      } catch (err) {
        this._logger.error("start: Error from getUser:", err instanceof Error ? err.message : err);
      }
    }
  }
  stop() {
    if (this._isStarted) {
      this._userManager.events.removeAccessTokenExpiring(this._tokenExpiring);
      this._isStarted = false;
    }
  }
};

// src/UserManager.ts
var UserManager = class {
  constructor(settings) {
    this.settings = new UserManagerSettingsStore(settings);
    this._logger = new Logger("UserManager");
    this._client = new OidcClient(settings);
    this._redirectNavigator = new RedirectNavigator(this.settings);
    this._popupNavigator = new PopupNavigator(this.settings);
    this._iframeNavigator = new IFrameNavigator(this.settings);
    this._events = new UserManagerEvents(this.settings);
    this._silentRenewService = new SilentRenewService(this);
    if (this.settings.automaticSilentRenew) {
      this._logger.debug("ctor: automaticSilentRenew is configured, setting up silent renew");
      this.startSilentRenew();
    }
    this._sessionMonitor = null;
    if (this.settings.monitorSession) {
      this._logger.debug("ctor: monitorSession is configured, setting up session monitor");
      this._sessionMonitor = new SessionMonitor(this);
    }
    this._tokenClient = new TokenClient(this.settings, this.metadataService);
  }
  get events() {
    return this._events;
  }
  get metadataService() {
    return this._client.metadataService;
  }
  async getUser() {
    const user = await this._loadUser();
    if (user) {
      this._logger.info("getUser: user loaded");
      this._events.load(user, false);
      return user;
    }
    this._logger.info("getUser: user not found in storage");
    return null;
  }
  async removeUser() {
    await this.storeUser(null);
    this._logger.info("removeUser: user removed from storage");
    this._events.unload();
  }
  async signinRedirect(args = {}) {
    const {
      redirectMethod,
      ...requestArgs
    } = args;
    const handle = await this._redirectNavigator.prepare({ redirectMethod });
    await this._signinStart({
      request_type: "si:r",
      ...requestArgs
    }, handle);
    this._logger.info("signinRedirect: successful");
  }
  async signinRedirectCallback(url = window.location.href) {
    const user = await this._signinEnd(url);
    if (user.profile && user.profile.sub) {
      this._logger.info("signinRedirectCallback: successful, signed in sub: ", user.profile.sub);
    } else {
      this._logger.info("signinRedirectCallback: no sub");
    }
    return user;
  }
  async signinPopup(args = {}) {
    const {
      popupWindowFeatures,
      popupWindowTarget,
      ...requestArgs
    } = args;
    const url = this.settings.popup_redirect_uri || this.settings.redirect_uri;
    if (!url) {
      this._logger.error("signinPopup: No popup_redirect_uri or redirect_uri configured");
      throw new Error("No popup_redirect_uri or redirect_uri configured");
    }
    const handle = await this._popupNavigator.prepare({ popupWindowFeatures, popupWindowTarget });
    const user = await this._signin({
      request_type: "si:p",
      redirect_uri: url,
      display: "popup",
      ...requestArgs
    }, handle);
    if (user) {
      if (user.profile && user.profile.sub) {
        this._logger.info("signinPopup: signinPopup successful, signed in sub: ", user.profile.sub);
      } else {
        this._logger.info("signinPopup: no sub");
      }
    }
    return user;
  }
  async signinPopupCallback(url = window.location.href, keepOpen = false) {
    try {
      await this._popupNavigator.callback(url, keepOpen);
      this._logger.info("signinPopupCallback: successful");
    } catch (err) {
      this._logger.error("signinPopupCallback error", err instanceof Error ? err.message : err);
    }
  }
  async signinSilent(args = {}) {
    const {
      silentRequestTimeoutInSeconds,
      ...requestArgs
    } = args;
    let user = await this._loadUser();
    if (user && user.refresh_token) {
      return this._useRefreshToken(user);
    }
    const url = this.settings.silent_redirect_uri || this.settings.redirect_uri;
    if (!url) {
      this._logger.error("signinSilent: No silent_redirect_uri configured");
      throw new Error("No silent_redirect_uri configured");
    }
    let verifySub;
    if (user && this.settings.validateSubOnSilentRenew) {
      this._logger.debug("signinSilent, subject prior to silent renew: ", user.profile.sub);
      verifySub = user.profile.sub;
    }
    const handle = await this._iframeNavigator.prepare({ silentRequestTimeoutInSeconds });
    user = await this._signin({
      request_type: "si:s",
      redirect_uri: url,
      prompt: "none",
      id_token_hint: this.settings.includeIdTokenInSilentRenew ? user == null ? void 0 : user.id_token : void 0,
      ...requestArgs
    }, handle, verifySub);
    if (user) {
      if (user.profile && user.profile.sub) {
        this._logger.info("signinSilent: successful, signed in sub: ", user.profile.sub);
      } else {
        this._logger.info("signinSilent: no sub");
      }
    }
    return user;
  }
  async _useRefreshToken(user) {
    const result = await this._tokenClient.exchangeRefreshToken({
      refresh_token: user.refresh_token || ""
    });
    if (!result) {
      this._logger.error("_useRefreshToken: No response returned from token endpoint");
      throw new Error("No response returned from token endpoint");
    }
    if (!result.access_token) {
      this._logger.error("_useRefreshToken: No access token returned from token endpoint");
      throw new Error("No access token returned from token endpoint");
    }
    if (result.id_token) {
      await this._validateIdTokenFromTokenRefreshToken(user.profile, result.id_token);
    }
    this._logger.debug("_useRefreshToken: refresh token response success");
    user.id_token = result.id_token || user.id_token;
    user.access_token = result.access_token || user.access_token;
    user.refresh_token = result.refresh_token || user.refresh_token;
    user.expires_in = result.expires_in;
    await this.storeUser(user);
    this._events.load(user);
    return user;
  }
  async _validateIdTokenFromTokenRefreshToken(profile, id_token) {
    const payload = JwtUtils.decode(id_token);
    if (!payload) {
      this._logger.error("_validateIdTokenFromTokenRefreshToken: Failed to decode id_token");
      throw new Error("Failed to decode id_token");
    }
    if (payload.sub !== profile.sub) {
      this._logger.error("_validateIdTokenFromTokenRefreshToken: sub in id_token does not match current sub");
      throw new Error("sub in id_token does not match current sub");
    }
    if (payload.auth_time && payload.auth_time !== profile.auth_time) {
      this._logger.error("_validateIdTokenFromTokenRefreshToken: auth_time in id_token does not match original auth_time");
      throw new Error("auth_time in id_token does not match original auth_time");
    }
    if (payload.azp && payload.azp !== profile.azp) {
      this._logger.error("_validateIdTokenFromTokenRefreshToken: azp in id_token does not match original azp");
      throw new Error("azp in id_token does not match original azp");
    }
    if (!payload.azp && profile.azp) {
      this._logger.error("_validateIdTokenFromTokenRefreshToken: azp not in id_token, but present in original id_token");
      throw new Error("azp not in id_token, but present in original id_token");
    }
  }
  async signinSilentCallback(url = window.location.href) {
    await this._iframeNavigator.callback(url);
    this._logger.info("signinSilentCallback: successful");
  }
  async signinCallback(url = window.location.href) {
    const { state } = await this._client.readSigninResponseState(url);
    if (state.request_type === "si:r") {
      return this.signinRedirectCallback(url);
    }
    if (state.request_type === "si:p") {
      await this.signinPopupCallback(url);
      return null;
    }
    if (state.request_type === "si:s") {
      await this.signinSilentCallback(url);
      return null;
    }
    throw new Error("invalid response_type in state");
  }
  async signoutCallback(url = window.location.href, keepOpen = false) {
    const { state } = await this._client.readSignoutResponseState(url);
    if (state) {
      if (state.request_type === "so:r") {
        await this.signoutRedirectCallback(url);
      }
      if (state.request_type === "so:p") {
        await this.signoutPopupCallback(url, keepOpen);
      }
      throw new Error("invalid response_type in state");
    }
  }
  async querySessionStatus(args = {}) {
    const {
      silentRequestTimeoutInSeconds,
      ...requestArgs
    } = args;
    const url = this.settings.silent_redirect_uri || this.settings.redirect_uri;
    if (!url) {
      this._logger.error("querySessionStatus: No silent_redirect_uri configured");
      throw new Error("No silent_redirect_uri configured");
    }
    const handle = await this._iframeNavigator.prepare({ silentRequestTimeoutInSeconds });
    const navResponse = await this._signinStart({
      request_type: "si:s",
      redirect_uri: url,
      prompt: "none",
      response_type: this.settings.query_status_response_type,
      scope: "openid",
      skipUserInfo: true,
      ...requestArgs
    }, handle);
    try {
      const signinResponse = await this._client.processSigninResponse(navResponse.url);
      this._logger.debug("querySessionStatus: got signin response");
      if (signinResponse.session_state && signinResponse.profile.sub) {
        this._logger.info("querySessionStatus: querySessionStatus success for sub: ", signinResponse.profile.sub);
        return {
          session_state: signinResponse.session_state,
          sub: signinResponse.profile.sub,
          sid: signinResponse.profile.sid
        };
      }
      this._logger.info("querySessionStatus: successful, user not authenticated");
      return null;
    } catch (err) {
      if (this.settings.monitorAnonymousSession && err instanceof ErrorResponse && err.session_state) {
        if (err.message == "login_required" || err.message == "consent_required" || err.message == "interaction_required" || err.message == "account_selection_required") {
          this._logger.info("querySessionStatus: querySessionStatus success for anonymous user");
          return {
            session_state: err.session_state
          };
        }
      }
      throw err;
    }
  }
  async _signin(args, handle, verifySub) {
    const navResponse = await this._signinStart(args, handle);
    return this._signinEnd(navResponse.url, verifySub);
  }
  async _signinStart(args, handle) {
    this._logger.debug("_signinStart: got navigator window handle");
    try {
      const signinRequest = await this._client.createSigninRequest(args);
      this._logger.debug("_signinStart: got signin request");
      return await handle.navigate({
        url: signinRequest.url,
        state: signinRequest.state.id,
        response_mode: signinRequest.state.response_mode
      });
    } catch (err) {
      this._logger.debug("_signinStart: Error after preparing navigator, closing navigator window");
      handle.close();
      throw err;
    }
  }
  async _signinEnd(url, verifySub) {
    const signinResponse = await this._client.processSigninResponse(url);
    this._logger.debug("_signinEnd: got signin response");
    const user = new User(signinResponse);
    if (verifySub) {
      if (verifySub !== user.profile.sub) {
        this._logger.debug("_signinEnd: current user does not match user returned from signin. sub from signin: ", user.profile.sub);
        throw new Error("login_required");
      } else {
        this._logger.debug("_signinEnd: current user matches user returned from signin");
      }
    }
    await this.storeUser(user);
    this._logger.debug("_signinEnd: user stored");
    this._events.load(user);
    return user;
  }
  async signoutRedirect(args = {}) {
    const {
      redirectMethod,
      ...requestArgs
    } = args;
    const handle = await this._redirectNavigator.prepare({ redirectMethod });
    await this._signoutStart({
      request_type: "so:r",
      post_logout_redirect_uri: this.settings.post_logout_redirect_uri,
      ...requestArgs
    }, handle);
    this._logger.info("signoutRedirect: successful");
  }
  async signoutRedirectCallback(url = window.location.href) {
    const response = await this._signoutEnd(url);
    this._logger.info("signoutRedirectCallback: successful");
    return response;
  }
  async signoutPopup(args = {}) {
    const {
      popupWindowFeatures,
      popupWindowTarget,
      ...requestArgs
    } = args;
    const url = this.settings.popup_post_logout_redirect_uri || this.settings.post_logout_redirect_uri;
    const handle = await this._popupNavigator.prepare({ popupWindowFeatures, popupWindowTarget });
    await this._signout({
      request_type: "so:p",
      post_logout_redirect_uri: url,
      state: url == null ? void 0 : {},
      ...requestArgs
    }, handle);
    this._logger.info("signoutPopup: successful");
  }
  async signoutPopupCallback(url = window.location.href, keepOpen = false) {
    await this._popupNavigator.callback(url, keepOpen);
    this._logger.info("signoutPopupCallback: successful");
  }
  async _signout(args, handle) {
    const navResponse = await this._signoutStart(args, handle);
    return this._signoutEnd(navResponse.url);
  }
  async _signoutStart(args = {}, handle) {
    var _a;
    this._logger.debug("_signoutStart: got navigator window handle");
    try {
      const user = await this._loadUser();
      this._logger.debug("_signoutStart: loaded current user from storage");
      if (this.settings.revokeAccessTokenOnSignout) {
        await this._revokeInternal(user, true);
      }
      const id_token = args.id_token_hint || user && user.id_token;
      if (id_token) {
        this._logger.debug("_signoutStart: Setting id_token into signout request");
        args.id_token_hint = id_token;
      }
      await this.removeUser();
      this._logger.debug("_signoutStart: user removed, creating signout request");
      const signoutRequest = await this._client.createSignoutRequest(args);
      this._logger.debug("_signoutStart: got signout request");
      return await handle.navigate({
        url: signoutRequest.url,
        state: (_a = signoutRequest.state) == null ? void 0 : _a.id
      });
    } catch (err) {
      this._logger.debug("_signoutStart: Error after preparing navigator, closing navigator window");
      handle.close();
      throw err;
    }
  }
  async _signoutEnd(url) {
    const signoutResponse = await this._client.processSignoutResponse(url);
    this._logger.debug("_signoutEnd: got signout response");
    return signoutResponse;
  }
  async revokeAccessToken() {
    const user = await this._loadUser();
    const success = await this._revokeInternal(user, false);
    if (success && user) {
      this._logger.debug("revokeAccessToken: removing token properties from user and re-storing");
      user.access_token = "";
      user.refresh_token = "";
      user.expires_at = 0;
      user.token_type = "";
      await this.storeUser(user);
      this._logger.debug("revokeAccessToken: user stored");
      this._events.load(user);
    }
    this._logger.info("revokeAccessToken: access token revoked successfully");
  }
  async _revokeInternal(user, optional) {
    if (!user) {
      return false;
    }
    if (!user.access_token && !user.refresh_token) {
      this._logger.debug("revokeAccessToken: no need to revoke due to no token(s)");
      return false;
    }
    if (user.access_token) {
      await this._tokenClient.revoke({
        token: user.access_token,
        token_type_hint: "access_token",
        optional
      });
    }
    if (user.refresh_token) {
      await this._tokenClient.revoke({
        token: user.refresh_token,
        token_type_hint: "refresh_token",
        optional
      });
    }
    return true;
  }
  startSilentRenew() {
    void this._silentRenewService.start();
  }
  stopSilentRenew() {
    this._silentRenewService.stop();
  }
  get _userStoreKey() {
    return `user:${this.settings.authority}:${this.settings.client_id}`;
  }
  async _loadUser() {
    const storageString = await this.settings.userStore.get(this._userStoreKey);
    if (storageString) {
      this._logger.debug("_loadUser: user storageString loaded");
      return User.fromStorageString(storageString);
    }
    this._logger.debug("_loadUser: no user storageString");
    return null;
  }
  async storeUser(user) {
    if (user) {
      this._logger.debug("storeUser: storing user");
      const storageString = user.toStorageString();
      await this.settings.userStore.set(this._userStoreKey, storageString);
    } else {
      this._logger.debug("storeUser: removing user");
      await this.settings.userStore.remove(this._userStoreKey);
    }
  }
  async clearStaleState() {
    await this._client.clearStaleState();
  }
};

// package.json
var version = "2.0.0-rc.2";

// src/Version.ts
var Version = version;
export {
  AccessTokenEvents,
  CheckSessionIFrame,
  ErrorResponse,
  InMemoryWebStorage,
  Log,
  MetadataService,
  OidcClient,
  OidcClientSettingsStore,
  SessionMonitor,
  SigninResponse,
  SigninState,
  SignoutResponse,
  State,
  User,
  UserManager,
  UserManagerSettingsStore,
  Version,
  WebStorageStateStore
};
//# sourceMappingURL=oidc-client-ts.js.map
