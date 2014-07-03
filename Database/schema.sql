--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

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
-- Name: client; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE client (
    id bigint NOT NULL,
    date_created timestamp with time zone NOT NULL,
    date_modified timestamp with time zone NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.client OWNER TO postgres;

--
-- Name: client_location; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE client_location (
    id bigint NOT NULL,
    date_created timestamp with time zone NOT NULL,
    date_modified timestamp with time zone NOT NULL,
    description character varying(255) NOT NULL,
    client_id bigint NOT NULL
);


ALTER TABLE public.client_location OWNER TO postgres;

--
-- Name: TABLE client_location; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE client_location IS 'describes a location of client interest';


--
-- Name: data_set; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE data_set (
    id bigint NOT NULL,
    date_created timestamp with time zone NOT NULL,
    deleted boolean NOT NULL
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
    date_created timestamp with time zone NOT NULL,
    description character varying(255) NOT NULL,
    value bytea NOT NULL,
    deleted boolean NOT NULL,
    data_set_id bigint NOT NULL
);


ALTER TABLE public.data_set_attachment OWNER TO postgres;

--
-- Name: TABLE data_set_attachment; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE data_set_attachment IS 'stores binary file attachments';


--
-- Name: data_set_boolean; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE data_set_boolean (
    id bigint NOT NULL,
    date_created timestamp with time zone NOT NULL,
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
-- Name: data_set_client_location; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE data_set_client_location (
    data_set_id bigint NOT NULL,
    date_created timestamp with time zone NOT NULL,
    client_location_id bigint NOT NULL
);


ALTER TABLE public.data_set_client_location OWNER TO postgres;

--
-- Name: TABLE data_set_client_location; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE data_set_client_location IS 'describes relationships of data to client locations';


--
-- Name: data_set_date; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE data_set_date (
    id bigint NOT NULL,
    date_created timestamp with time zone NOT NULL,
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
-- Name: data_set_integer; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE data_set_integer (
    id bigint NOT NULL,
    date_created timestamp with time zone NOT NULL,
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
-- Name: data_set_real; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE data_set_real (
    id bigint NOT NULL,
    date_created timestamp with time zone NOT NULL,
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
-- Name: data_set_text; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE data_set_text (
    id bigint NOT NULL,
    date_created timestamp with time zone NOT NULL,
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
-- Name: data_set_user; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE data_set_user (
    data_set_id bigint NOT NULL,
    date_created timestamp with time zone NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.data_set_user OWNER TO postgres;

--
-- Name: TABLE data_set_user; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE data_set_user IS 'describes relationships of data to originating users';


--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE "user" (
    id bigint NOT NULL,
    date_created timestamp with time zone NOT NULL,
    date_modified timestamp with time zone NOT NULL,
    email_address character varying(255) NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_access_level; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE user_access_level (
    id bigint NOT NULL,
    date_created timestamp with time zone NOT NULL,
    date_modified timestamp with time zone NOT NULL,
    description character varying(255) NOT NULL
);


ALTER TABLE public.user_access_level OWNER TO postgres;

--
-- Name: TABLE user_access_level; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE user_access_level IS 'defines available privileges a user might have';


--
-- Name: user_session; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE user_session (
    id bigint NOT NULL,
    date_created timestamp with time zone NOT NULL,
    date_modified timestamp with time zone NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    user_id bigint NOT NULL
);


ALTER TABLE public.user_session OWNER TO postgres;

--
-- Name: TABLE user_session; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE user_session IS 'tracks client-side session activity for each user';


--
-- Name: user_session_detail; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE user_session_detail (
    id bigint NOT NULL,
    date_created timestamp with time zone NOT NULL,
    date_modified timestamp with time zone NOT NULL,
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
-- Name: user_to_user_access_level; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE user_to_user_access_level (
    id bigint NOT NULL,
    date_created timestamp with time zone NOT NULL,
    date_modified timestamp with time zone NOT NULL,
    user_id bigint NOT NULL,
    access_level_id bigint NOT NULL
);


ALTER TABLE public.user_to_user_access_level OWNER TO postgres;

--
-- Name: TABLE user_to_user_access_level; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE user_to_user_access_level IS 'defines which privileges a user may have';


--
-- Name: client_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY client
    ADD CONSTRAINT client_name_key UNIQUE (name);


--
-- Name: pk_client; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY client
    ADD CONSTRAINT pk_client PRIMARY KEY (id);


--
-- Name: pk_client_location; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY client_location
    ADD CONSTRAINT pk_client_location PRIMARY KEY (id);


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
-- Name: pk_data_set_client_location; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY data_set_client_location
    ADD CONSTRAINT pk_data_set_client_location PRIMARY KEY (data_set_id);


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
-- Name: pk_data_set_user; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY data_set_user
    ADD CONSTRAINT pk_data_set_user PRIMARY KEY (data_set_id);


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
-- Name: user_email_address_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY "user"
    ADD CONSTRAINT user_email_address_key UNIQUE (email_address);


--
-- Name: fk_client_location_data_set; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_client_location
    ADD CONSTRAINT fk_client_location_data_set FOREIGN KEY (data_set_id) REFERENCES data_set(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_data_set_attachment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_attachment
    ADD CONSTRAINT fk_data_set_attachment FOREIGN KEY (data_set_id) REFERENCES data_set(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_data_set_boolean; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_boolean
    ADD CONSTRAINT fk_data_set_boolean FOREIGN KEY (data_set_id) REFERENCES data_set(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_data_set_client_location; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_client_location
    ADD CONSTRAINT fk_data_set_client_location FOREIGN KEY (client_location_id) REFERENCES client_location(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_data_set_date; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_date
    ADD CONSTRAINT fk_data_set_date FOREIGN KEY (data_set_id) REFERENCES data_set(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_data_set_integer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_integer
    ADD CONSTRAINT fk_data_set_integer FOREIGN KEY (data_set_id) REFERENCES data_set(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_data_set_real; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_real
    ADD CONSTRAINT fk_data_set_real FOREIGN KEY (data_set_id) REFERENCES data_set(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_data_set_text; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_text
    ADD CONSTRAINT fk_data_set_text FOREIGN KEY (data_set_id) REFERENCES data_set(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_data_set_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_user
    ADD CONSTRAINT fk_data_set_user FOREIGN KEY (data_set_id) REFERENCES "user"(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_detail_to_session; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_session_detail
    ADD CONSTRAINT fk_detail_to_session FOREIGN KEY (session_id) REFERENCES user_session(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_location_to_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY client_location
    ADD CONSTRAINT fk_location_to_client FOREIGN KEY (client_id) REFERENCES client(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: fk_session_to_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_session
    ADD CONSTRAINT fk_session_to_user FOREIGN KEY (user_id) REFERENCES "user"(id)
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
-- Name: fk_user_data_set; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY data_set_user
    ADD CONSTRAINT fk_user_data_set FOREIGN KEY (data_set_id) REFERENCES data_set(id)
    ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

