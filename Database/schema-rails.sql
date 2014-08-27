--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET clients_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET clients_min_messages = warning;

--
-- Name: postgres; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: adminpack; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS adminpack WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION adminpack; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION adminpack IS 'administrative functions for PostgreSQL';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE IF NOT EXISTS clients (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE clients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.clients_id_seq OWNER TO postgres;

--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE clients_id_seq OWNED BY clients.id;


--
-- Name: client_locations; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE client_locations (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    description character varying(255) NOT NULL,
    clients_id bigint NOT NULL
);


ALTER TABLE public.client_locations OWNER TO postgres;

--
-- Name: TABLE client_locations; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE client_locations IS 'describes a location of client interest';


--
-- Name: client_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE client_locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.client_locations_id_seq OWNER TO postgres;

--
-- Name: client_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE client_locations_id_seq OWNED BY client_location.id;


--
-- Name: data_set; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE data_set (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by bigint,
    date_deleted timestamp with time zone,
    deleted_by bigint,
    client_locations_id bigint,
    uuid uuid NOT NULL
);


ALTER TABLE public.data_set OWNER TO postgres;

--
-- Name: TABLE data_set; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE data_set IS 'describes a collection of data';


--
-- Name: data_set_attachment; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE data_set_attachment (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by bigint,
    date_deleted timestamp with time zone,
    deleted_by bigint,
    filename character varying(255) NOT NULL,
    mime_type character varying(255) NOT NULL,
    contents bytea NOT NULL,
    data_set_id bigint NOT NULL
);


ALTER TABLE public.data_set_attachment OWNER TO postgres;

--
-- Name: TABLE data_set_attachment; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE data_set_attachment IS 'stores binary file attachments';


--
-- Name: data_set_attachment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE data_set_attachment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.data_set_attachment_id_seq OWNER TO postgres;

--
-- Name: data_set_attachment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE data_set_attachment_id_seq OWNED BY data_set_attachment.id;


--
-- Name: data_set_boolean; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE data_set_boolean (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by bigint,
    date_deleted timestamp with time zone,
    deleted_by bigint,
    description character varying(255) NOT NULL,
    value boolean NOT NULL,
    data_set_id bigint NOT NULL
);


ALTER TABLE public.data_set_boolean OWNER TO postgres;

--
-- Name: TABLE data_set_boolean; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE data_set_boolean IS 'stores true/false primitive data';


--
-- Name: data_set_boolean_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE data_set_boolean_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.data_set_boolean_id_seq OWNER TO postgres;

--
-- Name: data_set_boolean_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE data_set_boolean_id_seq OWNED BY data_set_boolean.id;


--
-- Name: data_set_date; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE data_set_date (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by bigint,
    date_deleted timestamp with time zone,
    deleted_by bigint,
    description character varying(255) NOT NULL,
    value timestamp with time zone NOT NULL,
    data_set_id bigint NOT NULL
);


ALTER TABLE public.data_set_date OWNER TO postgres;

--
-- Name: TABLE data_set_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE data_set_date IS 'stores date data';


--
-- Name: data_set_date_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE data_set_date_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.data_set_date_id_seq OWNER TO postgres;

--
-- Name: data_set_date_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE data_set_date_id_seq OWNED BY data_set_date.id;


--
-- Name: data_set_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE data_set_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.data_set_id_seq OWNER TO postgres;

--
-- Name: data_set_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE data_set_id_seq OWNED BY data_set.id;


--
-- Name: data_set_integer; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE data_set_integer (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by bigint,
    date_deleted timestamp with time zone,
    deleted_by bigint,
    description character varying(255) NOT NULL,
    value bigint NOT NULL,
    data_set_id bigint NOT NULL
);


ALTER TABLE public.data_set_integer OWNER TO postgres;

--
-- Name: TABLE data_set_integer; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE data_set_integer IS 'stores numeric integer data';


--
-- Name: data_set_integer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE data_set_integer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.data_set_integer_id_seq OWNER TO postgres;

--
-- Name: data_set_integer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE data_set_integer_id_seq OWNED BY data_set_integer.id;


--
-- Name: data_set_real; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE data_set_real (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by bigint,
    date_deleted timestamp with time zone,
    deleted_by bigint,
    description character varying(255) NOT NULL,
    value double precision NOT NULL,
    data_set_id bigint NOT NULL
);


ALTER TABLE public.data_set_real OWNER TO postgres;

--
-- Name: TABLE data_set_real; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE data_set_real IS 'stores numeric real/double precision data';


--
-- Name: data_set_real_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE data_set_real_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.data_set_real_id_seq OWNER TO postgres;

--
-- Name: data_set_real_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE data_set_real_id_seq OWNED BY data_set_real.id;


--
-- Name: data_set_text; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE data_set_text (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by bigint,
    date_deleted timestamp with time zone,
    deleted_by bigint,
    description character varying(255) NOT NULL,
    value text NOT NULL,
    data_set_id bigint NOT NULL
);


ALTER TABLE public.data_set_text OWNER TO postgres;

--
-- Name: TABLE data_set_text; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE data_set_text IS 'stores text data';


--
-- Name: data_set_text_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE data_set_text_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.data_set_text_id_seq OWNER TO postgres;

--
-- Name: data_set_text_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE data_set_text_id_seq OWNED BY data_set_text.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE "user" (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    email_address character varying(255) NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_access_level; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE user_access_level (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    description character varying(255) NOT NULL
);


ALTER TABLE public.user_access_level OWNER TO postgres;

--
-- Name: TABLE user_access_level; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE user_access_level IS 'defines available privileges a user might have';


--
-- Name: user_access_level_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE user_access_level_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_access_level_id_seq OWNER TO postgres;

--
-- Name: user_access_level_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE user_access_level_id_seq OWNED BY user_access_level.id;


--
-- Name: user_api_token; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE user_api_token (
    id bigint NOT NULL,
    api_token character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expiration_date timestamp with time zone NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.user_api_token OWNER TO postgres;

--
-- Name: user_api_token_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE user_api_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_api_token_id_seq OWNER TO postgres;

--
-- Name: user_api_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE user_api_token_id_seq OWNED BY user_api_token.id;


--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE user_id_seq OWNED BY "user".id;


--
-- Name: user_session; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE user_session (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    user_id bigint NOT NULL
);


ALTER TABLE public.user_session OWNER TO postgres;

--
-- Name: TABLE user_session; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE user_session IS 'tracks clients-side session activity for each user';


--
-- Name: user_session_detail; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE user_session_detail (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    attribute character varying(255) NOT NULL,
    value character varying(255) NOT NULL,
    session_id bigint NOT NULL
);


ALTER TABLE public.user_session_detail OWNER TO postgres;

--
-- Name: TABLE user_session_detail; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE user_session_detail IS 'tracks arbitrary details about a session';


--
-- Name: user_session_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE user_session_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_session_detail_id_seq OWNER TO postgres;

--
-- Name: user_session_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE user_session_detail_id_seq OWNED BY user_session_detail.id;


--
-- Name: user_session_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE user_session_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_session_id_seq OWNER TO postgres;

--
-- Name: user_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE user_session_id_seq OWNED BY user_session.id;


--
-- Name: user_to_user_access_level; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE user_to_user_access_level (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id bigint NOT NULL,
    access_level_id bigint NOT NULL
);


ALTER TABLE public.user_to_user_access_level OWNER TO postgres;

--
-- Name: TABLE user_to_user_access_level; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE user_to_user_access_level IS 'defines which privileges a user may have';


--
-- Name: user_to_user_access_level_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE user_to_user_access_level_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_to_user_access_level_id_seq OWNER TO postgres;

--
-- Name: user_to_user_access_level_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE user_to_user_access_level_id_seq OWNED BY user_to_user_access_level.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY clients ALTER COLUMN id SET DEFAULT nextval('client_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY client_locations ALTER COLUMN id SET DEFAULT nextval('client_location_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set ALTER COLUMN id SET DEFAULT nextval('data_set_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_attachment ALTER COLUMN id SET DEFAULT nextval('data_set_attachment_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_boolean ALTER COLUMN id SET DEFAULT nextval('data_set_boolean_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_date ALTER COLUMN id SET DEFAULT nextval('data_set_date_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_integer ALTER COLUMN id SET DEFAULT nextval('data_set_integer_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_real ALTER COLUMN id SET DEFAULT nextval('data_set_real_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_text ALTER COLUMN id SET DEFAULT nextval('data_set_text_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "user" ALTER COLUMN id SET DEFAULT nextval('user_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_access_level ALTER COLUMN id SET DEFAULT nextval('user_access_level_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_api_token ALTER COLUMN id SET DEFAULT nextval('user_api_token_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_session ALTER COLUMN id SET DEFAULT nextval('user_session_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_session_detail ALTER COLUMN id SET DEFAULT nextval('user_session_detail_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_to_user_access_level ALTER COLUMN id SET DEFAULT nextval('user_to_user_access_level_id_seq'::regclass);


--
-- Name: clients_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY clients
    ADD CONSTRAINT clients_name_key UNIQUE (name);


--
-- Name: data_set_uuid_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY data_set
    ADD CONSTRAINT data_set_uuid_key UNIQUE (uuid);


--
-- Name: pk_clients; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY clients
    ADD CONSTRAINT pk_clients PRIMARY KEY (id);


--
-- Name: pk_client_locations; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY client_locations
    ADD CONSTRAINT pk_client_locations PRIMARY KEY (id);


--
-- Name: pk_data_set; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY data_set
    ADD CONSTRAINT pk_data_set PRIMARY KEY (id);


--
-- Name: pk_data_set_attachment; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY data_set_attachment
    ADD CONSTRAINT pk_data_set_attachment PRIMARY KEY (id);


--
-- Name: pk_data_set_boolean; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY data_set_boolean
    ADD CONSTRAINT pk_data_set_boolean PRIMARY KEY (id);


--
-- Name: pk_data_set_date; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY data_set_date
    ADD CONSTRAINT pk_data_set_date PRIMARY KEY (id);


--
-- Name: pk_data_set_integer; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY data_set_integer
    ADD CONSTRAINT pk_data_set_integer PRIMARY KEY (id);


--
-- Name: pk_data_set_real; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY data_set_real
    ADD CONSTRAINT pk_data_set_real PRIMARY KEY (id);


--
-- Name: pk_data_set_text; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY data_set_text
    ADD CONSTRAINT pk_data_set_text PRIMARY KEY (id);


--
-- Name: pk_user; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY "user"
    ADD CONSTRAINT pk_user PRIMARY KEY (id);


--
-- Name: pk_user_access_level; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY user_access_level
    ADD CONSTRAINT pk_user_access_level PRIMARY KEY (id);


--
-- Name: pk_user_api_token; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY user_api_token
    ADD CONSTRAINT pk_user_api_token PRIMARY KEY (id);


--
-- Name: pk_user_session; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY user_session
    ADD CONSTRAINT pk_user_session PRIMARY KEY (id);


--
-- Name: pk_user_session_detail; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY user_session_detail
    ADD CONSTRAINT pk_user_session_detail PRIMARY KEY (id);


--
-- Name: pk_user_to_user_access_level; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY user_to_user_access_level
    ADD CONSTRAINT pk_user_to_user_access_level PRIMARY KEY (id);


--
-- Name: user_access_level_description_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY user_access_level
    ADD CONSTRAINT user_access_level_description_key UNIQUE (description);


--
-- Name: user_api_token_api_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY user_api_token
    ADD CONSTRAINT user_api_token_api_token_key UNIQUE (api_token);


--
-- Name: user_email_address_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY "user"
    ADD CONSTRAINT user_email_address_key UNIQUE (email_address);


--
-- Name: fk_api_token_to_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_api_token
    ADD CONSTRAINT fk_api_token_to_user FOREIGN KEY (user_id) REFERENCES "user"(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_attachment_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_attachment
    ADD CONSTRAINT fk_attachment_created_by FOREIGN KEY (created_by) REFERENCES "user"(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_attachment_data_set; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_attachment
    ADD CONSTRAINT fk_attachment_data_set FOREIGN KEY (data_set_id) REFERENCES data_set(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_attachment_set_deleted_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_attachment
    ADD CONSTRAINT fk_attachment_set_deleted_by FOREIGN KEY (deleted_by) REFERENCES "user"(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_boolean_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_boolean
    ADD CONSTRAINT fk_boolean_created_by FOREIGN KEY (created_by) REFERENCES "user"(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_boolean_data_set; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_boolean
    ADD CONSTRAINT fk_boolean_data_set FOREIGN KEY (data_set_id) REFERENCES data_set(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_boolean_deleted_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_boolean
    ADD CONSTRAINT fk_boolean_deleted_by FOREIGN KEY (deleted_by) REFERENCES "user"(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_data_set_client_locations; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set
    ADD CONSTRAINT fk_data_set_client_locations FOREIGN KEY (client_location_id) REFERENCES client_location(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_data_set_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set
    ADD CONSTRAINT fk_data_set_created_by FOREIGN KEY (created_by) REFERENCES "user"(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_data_set_deleted_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set
    ADD CONSTRAINT fk_data_set_deleted_by FOREIGN KEY (deleted_by) REFERENCES "user"(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_created_at_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_date
    ADD CONSTRAINT fk_created_at_by FOREIGN KEY (created_by) REFERENCES "user"(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_date_data_set; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_date
    ADD CONSTRAINT fk_date_data_set FOREIGN KEY (data_set_id) REFERENCES data_set(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_date_deleted_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_date
    ADD CONSTRAINT fk_date_deleted_by FOREIGN KEY (deleted_by) REFERENCES "user"(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_detail_to_session; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_session_detail
    ADD CONSTRAINT fk_detail_to_session FOREIGN KEY (session_id) REFERENCES user_session(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_integer_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_integer
    ADD CONSTRAINT fk_integer_created_by FOREIGN KEY (created_by) REFERENCES "user"(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_integer_data_set; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_integer
    ADD CONSTRAINT fk_integer_data_set FOREIGN KEY (data_set_id) REFERENCES data_set(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_integer_deleted_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_integer
    ADD CONSTRAINT fk_integer_deleted_by FOREIGN KEY (deleted_by) REFERENCES "user"(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_location_to_clients; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY client_locations
    ADD CONSTRAINT fk_location_to_clients FOREIGN KEY (client_id) REFERENCES client(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_real_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_real
    ADD CONSTRAINT fk_real_created_by FOREIGN KEY (created_by) REFERENCES "user"(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_real_data_set; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_real
    ADD CONSTRAINT fk_real_data_set FOREIGN KEY (data_set_id) REFERENCES data_set(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_real_deleted_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_real
    ADD CONSTRAINT fk_real_deleted_by FOREIGN KEY (deleted_by) REFERENCES "user"(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_session_to_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_session
    ADD CONSTRAINT fk_session_to_user FOREIGN KEY (user_id) REFERENCES "user"(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_text_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_text
    ADD CONSTRAINT fk_text_created_by FOREIGN KEY (created_by) REFERENCES "user"(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_text_data_set; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_text
    ADD CONSTRAINT fk_text_data_set FOREIGN KEY (data_set_id) REFERENCES data_set(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_text_deleted_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_text
    ADD CONSTRAINT fk_text_deleted_by FOREIGN KEY (deleted_by) REFERENCES "user"(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_user_access_level_to_access_level; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_to_user_access_level
    ADD CONSTRAINT fk_user_access_level_to_access_level FOREIGN KEY (access_level_id) REFERENCES user_access_level(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_user_access_level_to_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_to_user_access_level
    ADD CONSTRAINT fk_user_access_level_to_user FOREIGN KEY (user_id) REFERENCES "user"(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

