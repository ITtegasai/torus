--
-- PostgreSQL database dump
--

-- Dumped from database version 14.9
-- Dumped by pg_dump version 16.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: four
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO four;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: user_data; Type: TABLE; Schema: public; Owner: four
--

CREATE TABLE public.user_data (
    id integer NOT NULL,
    first_name character varying,
    last_name character varying,
    gender character varying,
    birthday timestamp without time zone,
    reffer_id integer,
    email character varying(255)
);


ALTER TABLE public.user_data OWNER TO four;

--
-- Name: user_data_id_seq; Type: SEQUENCE; Schema: public; Owner: four
--

CREATE SEQUENCE public.user_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_data_id_seq OWNER TO four;

--
-- Name: user_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: four
--

ALTER SEQUENCE public.user_data_id_seq OWNED BY public.user_data.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: four
--

CREATE TABLE public.users (
    id integer NOT NULL,
    uid character varying(255) NOT NULL,
    username character varying(50) NOT NULL,
    pass_hash character varying(255) NOT NULL,
    role integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO four;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: four
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO four;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: four
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: user_data id; Type: DEFAULT; Schema: public; Owner: four
--

ALTER TABLE ONLY public.user_data ALTER COLUMN id SET DEFAULT nextval('public.user_data_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: four
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: user_data; Type: TABLE DATA; Schema: public; Owner: four
--

COPY public.user_data (id, first_name, last_name, gender, birthday, reffer_id, email) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: four
--

COPY public.users (id, uid, username, pass_hash, role, created_at, updated_at) FROM stdin;
2	34ee3abac747fee5c7330eb5fb99abe14fd4c114074f56b5927a81f7a429d5c2	four	$2b$12$TEACnaLiWUulKkEdroc6ROerqV5Dk5BAz4APM9U7ksrXf6OKpsMFS	0	\N	\N
\.


--
-- Name: user_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: four
--

SELECT pg_catalog.setval('public.user_data_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: four
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: four
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

